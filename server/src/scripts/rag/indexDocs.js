// 文档处理和向量入库脚本
const {
  embeddingChunks
} = require('../../services/rag/embedding')
const dealDocs = require("./dealDocs")
const chromaStore = require('../../services/rag/chromaStore')


async function indexDocs() {
  // 需要建立索引的官方文档目录
  let rootDir1 = 'server\\data\\docs\\react'
  let rootDir2 = 'server\\data\\docs\\vite'

  // 读取文档、清洗内容，并切成 chunks
  const [chunks1, chunks2] = await Promise.all([
    dealDocs(rootDir1),
    dealDocs(rootDir2)
  ])

  // 检查 vite 文档是否成功生成 chunks
  console.log('vite chunks', chunks2.length)
  console.log('react chunks', chunks1.length)

  // 主检索库只存正文 chunk，代码块 chunk 暂时不参与普通语义检索
  const chunks = [...chunks1, ...chunks2].filter(chunk => chunk.metadata.type !== 'code')


  // 调用 embedding.js，把 chunks 转成向量
  const chunksEmbedding = await embeddingChunks(chunks)
  console.log('1------------转换向量')


  // 存入 Chroma 向量数据库
  await chromaStore(chunksEmbedding)
  console.log('2------------存入向量数据库')
}

// 执行索引任务，出错时打印错误信息
indexDocs().catch(console.error)



// 后面可以在 server/package.json 里添加脚本命令
// 例如 npm run index:docs，专门用于重建向量索引
