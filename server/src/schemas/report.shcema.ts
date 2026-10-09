//结构化数据类型
import { z } from "zod"

export const report = z.object({
  title: z.string(),
  task: z.string(),
  conclusion: z.string(),
  analysis: z.string(),
  sourceMarkdown: z.string(),
  code: z.string()
})

//createMarkdown 工具的入参:由 Agent 决定,必须校验
export const createMarkdownInput = z.object({
  keyword: z.string().min(1),
  isMap: z.enum(['true', 'false', 'auto']).default('auto'),
})

export const judgeIsMapOutput = z.object({
  isMap: z.boolean(),
})



export type Report = z.infer<typeof report>
