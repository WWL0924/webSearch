//这里用于测试是否能存入向量数据库

//批处理脚本
const {
  embeddingChunks,
  embeddingKeywords
} = require('../../services/rag/embedding')
const dealDocs = require("../rag/dealDocs")
const chromaStore = require('../../services/rag/chromaStore')


async function indexDocs() {


  const chunksTest = dealDocs('server\\data\\docs\\test')
  // → 调用 embedding.js


  const embeddingTest = await embeddingChunks(chunksTest)
  console.log('------这里是测试,切片完成')

  //存入chroma数据库
  // await chromaStore(embeddingTest)
  // console.log('------这里是测试,存入向量库')
}
indexDocs().catch(console.error)



//server/src/scripts/indexDocs.js。
//后面可以在 server/package.json 里加一个脚本命令，比如 npm run index:docs，专门用于重建向量索引。