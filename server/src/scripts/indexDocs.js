//批处理脚本

const embedding = require("../services/embedding")
const dealDocs = require("./dealDocs")

async function indexDocs() {
  //调用 dealDocs(rootDir)
  // let rootDir1 = 'server\\data\\docs\\react'
  // let rootDir2 = 'server\\data\\docs\\vite'

  // → 拿到 chunks
  // const [chunks1, chunks2] = await Promise.all([
  //   dealDocs(rootDir1),
  //   dealDocs(rootDir2)
  // ])

  // const chunks = [...chunks1, ...chunks2]

  const chunksTest = dealDocs('server\\data\\docs\\test')
  // → 调用 embedding.js
  // const embedding = await embedding(chunks)

  const embeddingTest = await embedding(chunksTest)

  // → 调用 Chroma 写入

}
indexDocs().catch(console.error)



//server/src/scripts/indexDocs.js。
//后面可以在 server/package.json 里加一个脚本命令，比如 npm run index:docs，专门用于重建向量索引。