//1用户keyword转换为embedding
//2 比较向量距离找相关文档 chunks返回前端
import {
  embeddingKeywords
} from "./embedding.js"
import type { Search } from '../../schemas/search.schema.js'

type KeywordType = Search['keyword']

import retrieve from './retrieve.js'

async function ragSearch(keyword: KeywordType) {
  const embedding = await embeddingKeywords(keyword)
  // console.log('1返回向量', embedding)
  const res = await retrieve(embedding, keyword)
  console.log('*******ragsearch中retrive执行完毕')
  //这里返回的字段要详细渲染到页面上
  return res
}
// ragSearch('react')
export default ragSearch;
