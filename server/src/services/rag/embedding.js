
const path = require('path')

let pathRes = require("dotenv").config({
  path: path.join(__dirname, "../../../.env")
});//固定读取server/.env


const OpenAI = require("openai");
console.log('2检查key', process.env.DASHSCOPE_API_KEY);
const client = new OpenAI({
  //embedding模型
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.DASHSCOPE_API_KEY,
});


async function embeddingChunks(chunks) {

  //这里不能超过接口限制
  const batchSize = 10;
  let result = [];

  //分批
  for (let i = 0; i < chunks.length; i += batchSize) {

    const batch = chunks.slice(i, i + batchSize);

    const res = await client.embeddings.create({
      model: "text-embedding-v3",
      input: batch.map(item => item.content)
    });
    // console.log('-----调用向量模型', res.model)
    result.push(
      ...batch.map((item, index) => ({
        ...item,
        embedding: res.data[index].embedding
      }))
    );
  }

  return result;
}

//用户提问检索
// 输入一段或多段文本，输出对应向量
async function embeddingKeywords(keywords) {
  //调用 OpenAI 的 Embedding API
  const embedding = await client.embeddings.create({
    model: 'text-embedding-v3', //Embedding 模型
    input: keywords  //要转换的文本
  });
  // console.log('调用向量模型', res.model)
  // console.log('用户提问检索', embedding.data[0].embedding)

  //返回一个向量用于chroma查询
  return embedding.data[0].embedding
}

//注意这里导出到对象里
module.exports = {
  embeddingChunks,
  embeddingKeywords
}





