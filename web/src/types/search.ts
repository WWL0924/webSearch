//单条搜索接口
export interface ResultItem {
  ids: string,
  content: string
  source: string
  title: string
  section: string
  sourceUrl: string
  filePath: string
  chunkIndex: number
  type: string,
  parentSectionId?: string,
  lang?: string,
}

//搜索接口返回值
export interface SearchResponse {
  noContent?: boolean,
  resultList: ResultItem[],
  codeResults?: ResultItem[]
}

//select配置项类型
type selectiOption = {
  label: string,
  value: string
}
export type TypeSelectiOptions = selectiOption[]
