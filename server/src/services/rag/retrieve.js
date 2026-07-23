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

  console.log('-------检查返回的字段', result)
  //检查这里返回的字段
  return result.documents[0]
}


module.exports = retrieve