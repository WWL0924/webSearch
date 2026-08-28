//提取关键词

function extractKeywords(input: string) {

  const stopWords = new Set([
    '怎么',
    '如何',
    '为什么',
    '什么',
    '哪些',
    '一下',
    '的',
    '了',
    '吗',
    '是什么',
    '介绍一下'
  ])


  //1. 提取英文技术关键词
  const englishWords =
    input
      .toLowerCase()
      .match(/[a-z][a-z0-9_-]*/g) ?? []


  //2. 提取中文连续词
  const chineseWords =
    input.match(/[\u4e00-\u9fa5]{2,}/g) ?? []


  //3. 合并
  const keywords = [
    ...englishWords,
    ...chineseWords
  ]


  //4. 去重 + 过滤
  return [
    ...new Set(
      keywords.filter(word =>
        word.length > 1 &&
        !stopWords.has(word)
      )
    )
  ]

}


export default extractKeywords
