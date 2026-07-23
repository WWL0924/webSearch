//清除collection,整个向量数据库

const { client } = require('../../services/rag/chromaClient')



async function clear() {

  await client.deleteCollection({
    name: "knowledge-base"
  });

  console.log("Chroma collection 整个向量库已删除");
}

clear().catch(console.error)