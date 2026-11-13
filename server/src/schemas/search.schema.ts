//这里负责校验search的req
import { z } from "zod"
import officialSources from "../config/officialSources.js"

//这里source需要约束来源
const sourceOffical = z.enum(officialSources.map(source => source.key))
//输入
export const ragSearchInputSchema = z.object({
  keyword: z.string(),
  sources: z.array(sourceOffical).default([]) //这里可以允许多个来源
})

export const agentRequestSchema = ragSearchInputSchema.extend({
  ismd: z.boolean().default(false),
  isMap: z.enum(['true', 'false', 'auto']).default('auto')
})

//输出
// 在 search.schema.ts 添加
export const ragResultItemSchema = z.object({
  content: z.string(),
  title: z.string(),
  filePath: z.string(),
  sourceUrl: z.string(),
  score: z.number(),
  source: z.string(),
  section: z.string()
})

export const ragCodeResultItemSchema = z.object({
  content: z.string(),
  title: z.string(),
  sourceUrl: z.string(),
  source: z.string(),
  lang: z.string().optional()
})

export const ragSearchOutputSchema = z.object({
  success: z.boolean(),
  data: z.object({
    textChunks: z.array(ragResultItemSchema),
    codeChunks: z.array(ragCodeResultItemSchema),
    textChunkCount: z.number()
  })
})
export type ragResultItemType = z.infer<typeof ragResultItemSchema>
export type ragCodeResultItemType = z.infer<typeof ragCodeResultItemSchema>

export type ragSearchInputType = z.infer<typeof ragSearchInputSchema>;
export type ragSearchOutputType = z.infer<typeof ragSearchOutputSchema>
