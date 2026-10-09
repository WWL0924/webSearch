// 文档处理和向量入库脚本
import { embeddingChunks } from '../../services/rag/embedding.js';
import readAndChunkDocs from "./readAndChunkDocs.js";
import chromaStore from '../../services/rag/chromaStore.js';
import { getCollection } from '../../services/rag/chromaClient.js';
async function clearExistingChunks() {
    for (const collectionName of ['knowledge-base', 'code-examples']) {
        const collection = await getCollection(collectionName);
        const existingChunks = await collection.get({});
        if (existingChunks.ids.length > 0) {
            await collection.delete({ ids: existingChunks.ids });
        }
    }
}
async function indexDocs() {
    // 需要建立索引的官方文档目录
    let rootDir1 = 'data\\docs\\react';
    let rootDir2 = 'data\\docs\\vite';
    // 读取文档、清洗内容，并切成 chunks
    const [chunks1, chunks2] = await Promise.all([
        readAndChunkDocs(rootDir1),
        readAndChunkDocs(rootDir2)
    ]);
    console.log('1indexDocs------------切分完毕');
    // 检查 vite 文档是否成功生成 chunks
    console.log('vite chunks', chunks2.length);
    console.log('react chunks', chunks1.length);
    // 主检索库只存正文 chunk，代码块 chunk 存到独立 collection，按正文命中的章节关联检索
    const allChunks = [...chunks1, ...chunks2];
    const textChunks = allChunks.filter(chunk => chunk.metadata.type !== 'code');
    const codeChunks = allChunks.filter(chunk => chunk.metadata.type === 'code');
    // 调用 embedding.js，把 chunks 转成向量
    const textChunksEmbedding = await embeddingChunks(textChunks);
    const codeChunksEmbedding = await embeddingChunks(codeChunks);
    // console.log('2indexDocs-------------embedding')
    console.log('***正文 chunks 的类型', textChunksEmbedding[0]);
    console.log('***代码 chunks 的类型', codeChunksEmbedding[0]);
    // 存入 Chroma 向量数据库
    // 只有真正写入 Chroma，新的 metadata 才会在检索时生效。
    // 先删除旧 chunks，避免旧 metadata 与新索引混在一起。
    await clearExistingChunks();
    await chromaStore(textChunksEmbedding, 'knowledge-base');
    await chromaStore(codeChunksEmbedding, 'code-examples');
    console.log('31indexDocs------------存入向量数据库');
}
// 执行索引任务，出错时打印错误信息
indexDocs().catch(console.error);
// 后面可以在 server/package.json 里添加脚本命令
// 例如 npm run index:docs，专门用于重建向量索引
//# sourceMappingURL=indexDocs.js.map