//创建客户端

const { ChromaClient } = require("chromadb");





const client = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false
})

async function getCollection() {
  // 2. 获取 collection
  const collection = await client.getOrCreateCollection({
    name: "knowledge-base"
  })

  return collection
}

module.exports = { client, getCollection }