//结构化数据类型
import { z } from "zod"
import { ragResultItemSchema, ragCodeResultItemSchema } from './search.schema'

export const Report = z.object({
  title: z.string(),
  task: z.string(),
  conclusion: z.string(),
  analysis: z.string(),
  sourceMarkdown: z.string(),
  code: z.string()
})

// isMap = 'auto', keyword: string, list: chunkListType, codeResults: chunkListType = []


//createMarkdown 工具的入参:由 Agent 决定,必须校验
export const createMarkdownInputSchema = z.object({
  keyword: z.string().min(1),
  isMap: z.enum(['true', 'false', 'auto']).default('auto'),
  textChunks: z.array(ragResultItemSchema),
  codeChunks: z.array(ragCodeResultItemSchema),
})

export const judgeIsMapOutput = z.object({
  isMap: z.boolean(),
})

export const createMarkdownOutputSchema = z.object({
  mdFileName: z.string(),
  mapFileName: z.string().nullable()
})


export type Report = z.infer<typeof Report>
export type createMarkdownInputType = z.infer<typeof createMarkdownInputSchema>
export type createMarkdownOutputType = z.infer<typeof createMarkdownOutputSchema>
