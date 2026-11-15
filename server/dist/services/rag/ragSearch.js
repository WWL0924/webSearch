//1用户keyword转换为embedding
//2 比较向量距离找相关文档 chunks返回前端
import { embeddingKeywords } from "./embedding.js";
import detectSources from './detectSources.js';
import rewriteQuery from './rewriteQuery.js';
import officialSources from '../../config/officialSources.js';
import retrieve, { retrieveCodeBySections } from './retrieve.js';
import { AgentError } from "../../agent/errors.js";
//单次检索正文字符上限,不包含代码和元数据,也不等同于token数
const MAX_TEXT_CHARS = 6000;
async function ragSearch(ragseatchInput, signal) {
    signal?.throwIfAborted();
    //结构输入内容
    let { keyword = '', sources = [] } = ragseatchInput;
    // console.log('#####传到后端的sources', sources)
    // 查询改写：优化检索词以提升召回准确度
    const rewrittenKeyword = rewriteQuery(keyword);
    // console.log('*******原始查询:', keyword)
    // console.log('*******改写后查询:', rewrittenKeyword)
    //查询改写切片之后
    signal?.throwIfAborted();
    let embedding;
    try {
        embedding = await embeddingKeywords(rewrittenKeyword, signal);
    }
    catch (error) {
        //先保留请求中途取消
        if (error instanceof Error && error.name === 'AbortError')
            throw error;
        throw new AgentError('EMBEDDING_ERROR', '向量生成失败', false);
    }
    signal?.throwIfAborted();
    //如果用户没有传入
    if (sources.length === 0) {
        //分析来源
        sources = await detectSources(keyword);
        signal?.throwIfAborted();
    }
    //如果用户传入要把key转换为相应sources
    else {
        sources = officialSources.filter((item) => sources.includes(item.key)).map((item) => item.source);
    }
    signal?.throwIfAborted();
    //处理文本
    let res;
    let codeResults;
    try {
        res = await retrieve(embedding, keyword, sources, signal);
        signal?.throwIfAborted();
        //单次检索的文本长度
        let totalTextChars = res.resultList.reduce((total, item) => total + item.content.length, 0);
        const originalTextChars = totalTextChars;
        const originalChunkCount = res.resultList.length;
        //结果已按相关性排序,超出上限时从末尾移除完整片段
        while (totalTextChars > MAX_TEXT_CHARS && res.resultList.length > 0) {
            console.log('达到单次检索字数上限');
            const removedChunk = res.resultList.pop();
            if (removedChunk)
                totalTextChars -= removedChunk.content.length;
        }
        res.noContent = res.resultList.length === 0;
        console.log('单次检索正文长度统计', {
            originalTextChars,
            totalTextChars,
            maxTextChars: MAX_TEXT_CHARS,
            originalChunkCount,
            textChunkCount: res.resultList.length,
        });
        codeResults = res.resultList.length > 0
            ? await retrieveCodeBySections({
                //同一章节被切成三段,只需要查一次相关代码即可
                parentSectionIds: [...new Set(res.resultList.map(item => item.parentSectionId))],
                sources
            }, signal)
            : [];
    }
    catch (error) {
        //保留retrive中已经分类的错误
        if (error instanceof AgentError)
            throw error;
        if (error instanceof Error && error.name === 'AbortError')
            throw error;
        throw new AgentError('RETRIEVAL_FAILED', 'Rag检索错误', true);
    }
    signal?.throwIfAborted();
    // 过滤字段：只返回 Agent/前端需要的核心信息
    const filteredResults = res.resultList.map(item => ({
        content: item.content,
        title: item.title,
        filePath: item.filePath,
        sourceUrl: item.sourceUrl,
        score: item.rankScore,
        source: item.source,
        section: item.section
    }));
    const filteredCodeResults = codeResults.map(item => ({
        content: item.content,
        title: item.title,
        sourceUrl: item.sourceUrl,
        source: item.source,
        lang: item.lang
    }));
    console.log('*******ragsearch返回的结构', {
        success: true,
        data: {
            textChunks: filteredResults,
            codeChunks: filteredCodeResults,
            textChunkCount: filteredResults.length
        }
    });
    // 前端分别展示文字和代码
    return {
        success: true,
        data: {
            textChunks: filteredResults,
            // textChunks: [],//测试出现工具错误
            codeChunks: filteredCodeResults,
            textChunkCount: filteredResults.length
        }
    };
}
// ragSearch('react')
export default ragSearch;
//# sourceMappingURL=ragSearch.js.map