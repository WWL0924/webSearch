//1用户keyword转换为embedding
//2 比较向量距离找相关文档 chunks返回前端
const {
  embeddingChunks,
  embeddingKeywords
} = require("./embedding")

const retrieve = require('./retrieve')

async function ragSearch(keyword) {
  const embedding = await embeddingKeywords(keyword)
  // console.log('1返回向量', embedding)
  const res = await retrieve(embedding)
  console.log('*******ragsearch中返回的字段', res)
  //这里返回的字段要详细渲染到页面上
  return res
}
// ragSearch('react')
module.exports = ragSearch;