//创建客户端

import { ChromaClient } from "chromadb";

//一个chroma服务
const client = new ChromaClient({
  host: "localhost", //连接本机运行的chroma服务
  port: 8000,
  ssl: false
})

//这里函数的返回类型ts可以自动推导
async function getCollection(name = "knowledge-base") {
  // 2. 获取 collection
  const collection = await client.getOrCreateCollection({
    name
  })

  return collection
}

export { client, getCollection }
