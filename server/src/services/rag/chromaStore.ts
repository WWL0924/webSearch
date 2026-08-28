//写入chunks

import { getCollection } from './chromaClient.js'
import type { ChromaChunks } from '../../types/rag.js'


async function chromaStore(chunks: ChromaChunks[]) {
  const batchSize = 1000
  const collection = await getCollection()
  console.log('***chunks类型判断', chunks[0])



  for (let i = 0; i < chunks.length; i += batchSize) {
    // → 调用 Chroma 写入
    const batch = chunks.slice(i, i + batchSize)
    await collection.add({
      ids: batch.map(chunk => chunk.id),
      documents: batch.map(chunk => chunk.content),
      metadatas: batch.map(chunk => chunk.metadata),
      embeddings: batch.map(item => item.embedding)
    })
  }
  // console.log('-----存入chroma的向量维度', chunks[0].embedding.length)
}


export default chromaStore
