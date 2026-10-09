import { getCollection } from './chromaClient.js';
import extractKeywords from './extractKeywords.js';
//只读配置对象
const RAG_CONFIG = {
    nResults: 30, //chroma查询返回数量 (增加候选数量)
    //!这里命中知识库的阈值太低?
    hitDistance: 1, //知识库命中阈值
    filterDistance: 0.76, //距离过滤阈值
    fallbackLimit: 3, //普通结果返回数量
    resultLimit: 10, //过滤之后返回数量 (5→10 返回更多结果)
    maxChunksPerFile: 3, //同一文件最多保留的chunk数量
    codeResultLimit: 3, //关联代码块最多返回数量
    titleBoost: 0.05, //标题加权值
    filePathBoost: 0.03, //文件路径配置
};
async function retrieve(embedding, keyword, sources = []) {
    const collection = await getCollection(); //默认查询文本
    // console.log('检查collection', collection)
    console.log('传入retrive的source', sources);
    const where = sources.length > 0
        ? { source: { $in: sources } }
        : undefined;
    console.log('where', where);
    // 2. 去 Chroma 查询
    const result = await collection.query({
        queryEmbeddings: [embedding],
        nResults: RAG_CONFIG.nResults, //返回数量
        //
        ...(where ? { where } : {}),
        //最终展开成
        // where = {
        //   source: {
        //     $in: sources 数据的source中有sources数组中的元素任意一个值就匹配
        //   }
        // }
        //这里返回distances查询关键词和文档的距离
        include: ['documents', 'metadatas', 'distances']
    });
    console.log('0********返回的chunks结构', result);
    let distances = result.distances[0];
    let chunks = result.documents[0];
    let metadatas = result.metadatas[0];
    let ids = result.ids[0];
    //如果有一个不存在就返回
    if (!distances || !chunks || !metadatas || !ids) {
        return {
            noContent: true,
            resultList: [],
        };
    }
    console.log('*********打印distance查看范围', distances);
    //res是返回的20条中整理出符合chunks结构的?
    const res = chunks.map((chunk, index) => {
        //1校验metadata
        const metadata = metadatas[index];
        if (!metadata ||
            typeof metadata.source !== 'string' ||
            typeof metadata.filePath !== 'string' ||
            typeof metadata.title !== 'string' ||
            typeof metadata.section !== 'string' ||
            typeof metadata.sourceUrl !== 'string' ||
            typeof metadata.chunkIndex !== 'number' ||
            typeof metadata.type !== 'string' ||
            typeof metadata.parentSectionId !== 'string') {
            throw new Error(`第 ${index} 条检索结果的 metadata 不完整`);
        }
        //2校验distance
        const distancesTips = distances[index];
        if (distancesTips === null || distancesTips === undefined) {
            throw new Error(`第 ${index} 条结果没有 distance`);
        }
        return {
            ids: ids[index],
            content: chunks[index],
            source: metadata.source,
            title: metadata.title,
            section: metadata.section,
            sourceUrl: metadata.sourceUrl,
            filePath: metadata.filePath,
            chunkIndex: metadata.chunkIndex,
            type: metadata.type,
            parentSectionId: metadata.parentSectionId,
            ...(typeof metadata.lang === 'string' ? { lang: metadata.lang } : {}),
            distances: distancesTips,
            rankScore: distancesTips
        };
    });
    //0这里提取关键词
    const keywords = extractKeywords(keyword);
    console.log('0*******提取的关键词', keywords);
    //1判断是否命中知识库
    //这里首先判断distances是否存在
    let distancesTips = distances[0];
    if (distancesTips === null || distancesTips === undefined) {
        throw new Error(`没有distance`);
    }
    console.log('命中知识库的判断条件', distancesTips);
    if (distancesTips <= RAG_CONFIG.hitDistance) {
        //通过distance过滤掉不相关的chunks
        const maxDistance = RAG_CONFIG.filterDistance;
        const filtered = res.filter(item => item.distances <= maxDistance);
        console.log('1*****命中知识库并且相关有', filtered.length, '条信息');
        //2进行标题加权
        const res1 = filtered.map(item => {
            const title = item.title.toLowerCase();
            const filePath = item.filePath.toLowerCase();
            let rankScore = item.rankScore;
            if (keywords.some(word => title.includes(word))) {
                rankScore -= RAG_CONFIG.titleBoost;
                console.log(title, '2********标题加权');
            }
            if (keywords.some(word => filePath.includes(word))) {
                rankScore -= RAG_CONFIG.filePathBoost;
                console.log(filePath, '2********文件路径加权');
            }
            item.rankScore = rankScore;
            return item;
        });
        //然后根据rankScore升序排序
        let res2 = res1.sort((a, b) => a.rankScore - b.rankScore);
        console.log('2********根据rankscore升序排序');
        //3同一个filePath,最多保留maxChunksPerFile条
        const fileMap = new Map();
        res2.forEach(item => {
            const filePath = item.filePath;
            const existingItems = fileMap.get(filePath) || [];
            //如果该文件的chunk数量未达到上限,直接添加
            if (existingItems.length < RAG_CONFIG.maxChunksPerFile) {
                existingItems.push(item);
                fileMap.set(filePath, existingItems);
            }
            //如果已达上限,判断是否比现有的更相关
            else {
                //找到现有chunks中rankScore最大(最不相关)的
                const maxScoreIndex = existingItems.reduce((maxIdx, curr, idx, arr) => {
                    const maxItem = arr[maxIdx];
                    if (!maxItem)
                        return maxIdx;
                    return curr.rankScore > maxItem.rankScore ? idx : maxIdx;
                }, 0);
                const maxScoreItem = existingItems[maxScoreIndex];
                //如果当前item更相关,替换掉最不相关的那个
                if (maxScoreItem && item.rankScore < maxScoreItem.rankScore) {
                    existingItems[maxScoreIndex] = item;
                }
            }
        });
        //将Map中的数组展平,并按rankScore排序
        const uniqueFiles = Array.from(fileMap.values())
            .flat()
            .sort((a, b) => a.rankScore - b.rankScore);
        console.log('3********限制每文件chunk数后的结果', uniqueFiles.length, '条');
        //去重路径后为空,返回相近的前三条
        if (uniqueFiles.length === 0) {
            console.log('过滤后为空,返回相近的前三条', uniqueFiles.length);
            return {
                noContent: false,
                resultList: res.slice(0, RAG_CONFIG.fallbackLimit)
            };
        }
        //否则返回前10条
        else {
            return {
                noContent: false,
                resultList: uniqueFiles.slice(0, RAG_CONFIG.resultLimit)
            };
        }
    }
    //没有命中知识库
    else {
        return {
            noContent: true, //无有效上下文
            resultList: []
        };
    }
}
//根据正文检索对应代码块
async function retrieveCodeBySections({ parentSectionIds, sources = [] }) {
    if (parentSectionIds.length === 0) {
        return [];
    }
    //获取代码的collection
    const collection = await getCollection('code-examples');
    //根据parentSectionIds找和正文相同章节的code
    const where = {
        parentSectionId: { $in: parentSectionIds }
    };
    //这里是精确筛选
    const result = await collection.get({
        where, //按照明确条件找记录
        include: ['documents', 'metadatas']
    });
    const documents = result.documents;
    const metadatas = result.metadatas;
    return result.ids.flatMap((id, index) => {
        const content = documents[index];
        const metadata = metadatas[index];
        if (typeof content !== 'string' ||
            !metadata ||
            typeof metadata.source !== 'string' ||
            (sources.length > 0 && !sources.includes(metadata.source)) ||
            typeof metadata.filePath !== 'string' ||
            typeof metadata.title !== 'string' ||
            typeof metadata.section !== 'string' ||
            typeof metadata.sourceUrl !== 'string' ||
            typeof metadata.chunkIndex !== 'number' ||
            typeof metadata.type !== 'string' ||
            typeof metadata.parentSectionId !== 'string') {
            return [];
        }
        //返回符合要求的代码块
        return [{
                ids: id,
                content,
                source: metadata.source,
                title: metadata.title,
                section: metadata.section,
                sourceUrl: metadata.sourceUrl,
                filePath: metadata.filePath,
                chunkIndex: metadata.chunkIndex,
                type: metadata.type,
                parentSectionId: metadata.parentSectionId,
                ...(typeof metadata.lang === 'string' ? { lang: metadata.lang } : {}),
                distances: 0,
                rankScore: 0
            }];
    }).slice(0, RAG_CONFIG.codeResultLimit);
}
export { retrieveCodeBySections };
export default retrieve;
//# sourceMappingURL=retrieve.js.map