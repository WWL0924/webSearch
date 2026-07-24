const { getCollection } = require('./chromaClient')

async function retrieve(embedding) {
  const collection = await getCollection()
  console.log('检查collection', collection)
  // 2. 去 Chroma 查询
  const result = await collection.query({
    //查询向量(可以查询多个向量)
    queryEmbeddings: [embedding],
    //返回数量
    nResults: 5
  });

  // console.log('0********返回的result结构', result.metadatas[0][0])
  let chunks = result.documents[0]

  let metadatas = result.metadatas[0]

  const res = chunks.map((chunk, index) => {

    return {
      ids: result.ids[index],
      content: chunk,
      source: metadatas[index].source,
      title: metadatas[index].title,
      filePath: metadatas[index].filePath,
      type: metadatas[index].type,

    }

  })
  // console.log('*****retrive返回的', typeof res, res)

  return res
}


module.exports = retrieve