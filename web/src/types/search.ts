//单条搜索接口
export type { ragResultItemType, ragCodeResultItemType } from '../../../server/src/schemas/search.schema'

import type { ragResultItemType, ragCodeResultItemType } from '../../../server/src/schemas/search.schema'

//搜索接口返回值
export interface SearchResponse {
  noContent?: boolean,
  resultList: ragResultItemType[],
  codeResults?: ragCodeResultItemType[]
}

//select配置项类型
type selectiOption = {
  label: string,
  value: string
}
export type TypeSelectiOptions = selectiOption[]
