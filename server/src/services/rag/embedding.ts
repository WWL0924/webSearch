
import path from 'node:path'
import dotenv from "dotenv"
import OpenAI from "openai";
import { fileURLToPath } from 'node:url'
import type { Chunk, ChunkWithEmbedding } from '../../types/rag.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let pathRes = dotenv.config({
  path: path.join(__dirname, "../../../.env")
});//固定读取server/.env


console.log('2检查key', process.env.DASHSCOPE_API_KEY);
const client = new OpenAI({
  //embedding模型
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.DASHSCOPE_API_KEY,
});


async function embeddingChunks(chunks: Chunk[]): Promise<ChunkWithEmbedding[]> {

  //这里不能超过接口限制
  const batchSize = 10;
  let result = [];

  //分批
  for (let i = 0; i < chunks.length; i += batchSize) {

    const batch = chunks.slice(i, i + batchSize);

    const res = await client.embeddings.create({
      model: "text-embedding-v3",
      input: batch.map(item =>
        //这里把增强的文本用于embedding
        `标题：${item.metadata.title}\n路径：${item.metadata.filePath}\n
        正文：${item.content}`)
    });
    // console.log('-----调用向量模型', res.model)
    result.push(
      ...batch.map((item, index) => {
        const embeddingItem = res.data[index]
        if (!embeddingItem) {
          throw new Error(`第 ${index} 条文本没有对应的向量结果`)
        }
        return {
          ...item,
          embedding: embeddingItem.embedding
        }
      }
      )
    )
  }
  return result;

}

//用户提问检索
// 输入一段或多段文本，输出对应向量
async function embeddingKeywords(keywords: string): Promise<number[]> {
  //调用 OpenAI 的 Embedding API
  const embedding = await client.embeddings.create({
    model: 'text-embedding-v3', //Embedding 模型
    input: keywords  //要转换的文本
  });
  // console.log('调用向量模型', res.model)
  // console.log('用户提问检索', embedding.data[0].embedding)
  //这里先判断是否存在
  const testEmbedding = embedding.data[0]
  if (!testEmbedding) {
    throw new Error('用户提问检索失败')
  }


  //返回一个向量用于chroma查
  return testEmbedding.embedding

}

//注意这里导出到对象里
export {
  embeddingChunks,
  embeddingKeywords
}





