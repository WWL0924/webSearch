

import { getCollection } from './chromaClient.js'
import extractKeywords from './extractKeywords.js'
import type { SearchResultItem } from '../../types/rag.js'
import type { Where } from 'chromadb' //查询过滤条件的类型


//这里返回的字段要渲染到页面上
type RetriveType = {
  noContent: boolean,
  resultList: SearchResultItem[]
}

//只读配置对象
const RAG_CONFIG = {
  nResults: 20, //chroma查询返回数量
  //!这里命中知识库的阈值太低?
  hitDistance: 1, //知识库命中阈值
  filterDistance: 0.76, //距离过滤阈值
  fallbackLimit: 3, //普通结果返回数量
  resultLimit: 5, //过滤之后返回数量
  titleBoost: 0.05, //标题加权值
  filePathBoost: 0.03, //文件路径配置
} as const


async function retrieve(
  embedding: number[],
  keyword: string,
  sources: string[] = []): //默认值是空数组
  Promise<RetriveType> {
  const collection = await getCollection()
  // console.log('检查collection', collection)

  console.log('传入retrive的source', sources)
  const where: Where | undefined
    = sources.length > 0
      ? { source: { $in: sources } }
      : undefined

  console.log('where', where)

  // 2. 去 Chroma 查询
  const result = await collection.query({
    queryEmbeddings: [embedding],
    nResults: RAG_CONFIG.nResults,//返回数量
    //
    ...(where ? { where } : {}),
    //最终展开成
    // where = {
    //   source: {
    //     $in: sources 数据的source中有sources数组中的元素任意一个值就匹配
    //   }
    // }

    //这里返回distances查询关键词和文档的距离
    include: ['documents', 'metadatas', 'distances']
  })

  console.log('0********返回的chunks结构', result)

  let distances: (number | null)[] | undefined = result.distances[0]
  let chunks: (string | null)[] | undefined = result.documents[0]

  let metadatas = result.metadatas[0]
  let ids: (string | null)[] | undefined = result.ids[0]



  //如果有一个不存在就返回
  if (!distances || !chunks || !metadatas || !ids) {
    return {
      noContent: true,
      resultList: [],
    }
  }
  console.log('*********打印distance查看范围', distances)
  //res是返回的20条中整理出符合chunks结构的?
  const res: SearchResultItem[] = chunks.map((chunk, index) => {
    //1校验metadata
    const metadata = metadatas[index]

    if (
      !metadata ||
      typeof metadata.source !== 'string' ||
      typeof metadata.filePath !== 'string' ||
      typeof metadata.title !== 'string' ||
      typeof metadata.type !== 'string'
    ) {
      throw new Error(`第 ${index} 条检索结果的 metadata 不完整`)
    }

    //2校验distance
    const distancesTips = distances[index]
    if (distancesTips === null || distancesTips === undefined) {
      throw new Error(`第 ${index} 条结果没有 distance`)
    }
    return {
      ids: ids[index],
      content: chunks[index],
      source: metadata.source,
      title: metadata.title,
      filePath: metadata.filePath,
      type: metadata.type,
      distances: distancesTips,
      rankScore: distancesTips
    }

  })
  //0这里提取关键词
  const keywords = extractKeywords(keyword)
  console.log('0*******提取的关键词', keywords)

  //1判断是否命中知识库
  //这里首先判断distances是否存在
  let distancesTips = distances[0]
  if (distancesTips === null || distancesTips === undefined) {
    throw new Error(`没有distance`)
  }
  console.log('命中知识库的判断条件', distancesTips)
  if (distancesTips <= RAG_CONFIG.hitDistance) {
    //通过distance过滤掉不相关的chunks
    const maxDistance = RAG_CONFIG.filterDistance
    const filtered = res.filter(item => item.distances <= maxDistance)
    console.log('1*****命中知识库并且相关有', filtered.length, '条信息')

    //2进行标题加权
    const res1 = filtered.map(item => {
      const title = item.title.toLowerCase()
      const filePath = item.filePath.toLowerCase()
      let rankScore: number = item.rankScore

      if (keywords.some(word => title.includes(word))) {
        rankScore -= RAG_CONFIG.titleBoost
        console.log(title, '2********标题加权',)

      }
      if (keywords.some(word => filePath.includes(word))) {
        rankScore -= RAG_CONFIG.filePathBoost
        console.log(filePath, '2********文件路径加权')

      }
      item.rankScore = rankScore
      return item
    })

    //然后根据rankScore升序排序
    let res2 = res1.sort((a, b) => a.rankScore - b.rankScore)
    console.log('2********根据rankscore升序排序')

    //3同一个filePath,保留distance最小的那一条
    const fileMap = new Map()

    res2.forEach(item => {

      //?这里进行去重操作么?
      const oldItem = fileMap.get(item.filePath)//寻找当前路径

      //没有存过当前路径和更相关的替换掉旧
      if (!oldItem || item.rankScore < oldItem.rankScore) {
        fileMap.set(item.filePath, item) //这里会更新旧值
      }

    })

    const uniqueFiles1 = Array.from(fileMap.values())
    //根据rankScore,升序排序
    const uniqueFiles = uniqueFiles1.sort(
      (a, b) => a.rankScore - b.rankScore
    )
    console.log('3********去重路径之后的', uniqueFiles, uniqueFiles.length)


    //去重路径后为空,返回相近的前三条
    if (uniqueFiles.length === 0) {
      console.log('过滤后为空,返回相近的前三条', uniqueFiles.length)
      return {
        noContent: false,
        resultList: res.slice(0, RAG_CONFIG.fallbackLimit)
      }
    }
    //否则返回去重后的前五条
    else {
      return {
        noContent: false,
        resultList: uniqueFiles.slice(0, RAG_CONFIG.resultLimit)
      }
    }
  }
  //没有命中知识库
  else {

    return {
      noContent: true, //无有效上下文
      resultList: []
    }
  }

}


export default retrieve
