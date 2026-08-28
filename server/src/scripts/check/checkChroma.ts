//检查chroma

import type { Collection } from 'chromadb'
import { getCollection } from '../../services/rag/chromaClient.js'


//1按照来源检查
async function checkBySource(source: string, collection: Collection) {

  const res = await collection.get({
    where: { source },
    include: ['metadatas', 'embeddings']
  })

  console.log('===source数据来源:', source)
  console.log('===count查询结果数量:', res.ids.length)
  console.log('===dimension向量维度:', res.embeddings?.[0]?.length)
  console.log('===sample ids前三个id:', res.ids.slice(0, 3))
  console.log('===sample metadata附加信息:', res.metadatas.slice(0, 3))
}
async function mianCheck() {
  const collection = await getCollection()
  checkBySource('server\\data\\docs\\react', collection)
  checkBySource('server\\data\\docs\\vite', collection)
  checkBySource('server\\data\\docs\\test', collection)
}


mianCheck().catch(console.error)
