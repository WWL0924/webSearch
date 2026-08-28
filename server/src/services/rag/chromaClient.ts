//创建客户端

import { ChromaClient } from "chromadb";


const client = new ChromaClient({
  host: "localhost", //连接本机运行的chroma服务
  port: 8000,
  ssl: false
})

//这里函数的返回类型ts可以自动推导
async function getCollection() {
  // 2. 获取 collection
  const collection = await client.getOrCreateCollection({
    name: "knowledge-base"
  })

  return collection
}

export { client, getCollection }
