//这里负责校验search的req
import { z } from "zod"


export const aiSchema = z.object({
  keyword: z.string(),
  //这里就是表示list是对象数组
  list: z.array(
    z.object({
      ids: z.string(),
      content: z.string(),
      source: z.string(),
      title: z.string(),
      filePath: z.string(),
      type: z.string(),
    })
  ),
})


//数据校验规则自动转换为ts类型
export type AI = z.infer<typeof aiSchema>;
