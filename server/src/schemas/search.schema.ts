//这里负责校验search的req
import { z } from "zod"


export const searchSchema = z.object({
  keyword: z.string(),
})



export type Search = z.infer<typeof searchSchema>;
