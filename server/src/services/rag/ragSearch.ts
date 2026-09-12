//1用户keyword转换为embedding
//2 比较向量距离找相关文档 chunks返回前端
import {
  embeddingKeywords
} from "./embedding.js"
import detectSources from './detectSources.js'
import officialSources from '../../config/officialSources.js'
import type { Search } from '../../schemas/search.schema.js'

type KeywordType = Search['keyword']
import retrieve from './retrieve.js'


async function ragSearch(keyword: KeywordType, sources: string[] = []) {
  const embedding = await embeddingKeywords(keyword)
  //如果用户没有传入
  if (sources.length === 0) {
    //分析来源
    sources = await detectSources(keyword)
  }
  //如果用户传入要把key转换为相应sources
  else {
    sources = officialSources.filter((item) => sources.includes(item.key)).map((item) => item.source)
  }
  const res = await retrieve(embedding, keyword, sources)
  console.log('*******ragsearch中retrive执行完毕')
  //这里返回的字段要详细渲染到页面上
  return res
}
// ragSearch('react')
export default ragSearch;
