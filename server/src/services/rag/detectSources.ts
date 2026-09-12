//分析来源
import officialSources from '../../config/officialSources.js'

async function detectSources(keyword: string): Promise<string[]> {
  const lowerKeyword = keyword.toLowerCase()

  const sources = officialSources
    .filter(item => item.aliases.
      //keyword里包含了代替词就获取相应的source
      some(alias => lowerKeyword.includes(alias.toLowerCase())))
    .map(item => item.source)
  console.log('********命中的source', sources)
  return sources
}

export default detectSources