//1用户keyword转换为embedding
//2 比较向量距离找相关文档 chunks返回前端
import { embeddingKeywords } from "./embedding.js";
import detectSources from './detectSources.js';
import rewriteQuery from './rewriteQuery.js';
import officialSources from '../../config/officialSources.js';
import retrieve, { retrieveCodeBySections } from './retrieve.js';
async function ragSearch(keyword, sources = []) {
    // 查询改写：优化检索词以提升召回准确度
    const rewrittenKeyword = rewriteQuery(keyword);
    console.log('*******原始查询:', keyword);
    console.log('*******改写后查询:', rewrittenKeyword);
    const embedding = await embeddingKeywords(rewrittenKeyword);
    //如果用户没有传入
    if (sources.length === 0) {
        //分析来源
        sources = await detectSources(keyword);
    }
    //如果用户传入要把key转换为相应sources
    else {
        sources = officialSources.filter((item) => sources.includes(item.key)).map((item) => item.source);
    }
    //处理文本
    const res = await retrieve(embedding, keyword, sources);
    const codeResults = res.resultList.length > 0
        ? await retrieveCodeBySections({
            //同一章节被切成三段,只需要查一次相关代码即可
            parentSectionIds: [...new Set(res.resultList.map(item => item.parentSectionId))],
            sources
        })
        : [];
    console.log('*******ragsearch中retrive执行完毕');
    //前端分别展示文字和代码
    return {
        ...res,
        codeResults //代码查询
    };
}
// ragSearch('react')
export default ragSearch;
//# sourceMappingURL=ragSearch.js.map