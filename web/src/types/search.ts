//单条搜索接口
export interface ResultItem {
  ids: string,
  content: string
  source: string
  title: string
  filePath: string
  type: string,
}

//搜索接口返回值
export interface SearchResponse {
  noContent?: boolean,
  resultList: ResultItem[]
}

