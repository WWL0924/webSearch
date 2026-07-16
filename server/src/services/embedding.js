let res = require("dotenv").config();
console.log('1打印返回值', res)
const OpenAI = require("openai");
console.log('2检查key', process.env.DASHSCOPE_API_KEY);
const client = new OpenAI({
  // 这里需要指定阿里云的接口地址么
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.DASHSCOPE_API_KEY,
});


async function embedding(chunks) {
  //调用 OpenAI 的 Embedding API
  const embedding = await client.embeddings.create({
    model: 'text-embedding-v4', //Embedding 模型
    input: chunks.map(chunk => chunk.content) //要转换的文本
  });
  console.log(embedding.data[0].embedding)

  return chunks.map((chunk, index) => ({
    ...chunk,
    embedding: embedding.data[index].embedding
  }))
}

// const embeddingRes=await embedding()
module.exports = embedding





