//这里负责校验search的req
import { z } from "zod";
import { chunkSchema } from "./chunk.schema.js";
//输入:chunk 结构见 chunk.schema.ts,两侧共用
export const aiSchema = z.object({
    keyword: z.string().min(1).max(200),
    list: z.array(chunkSchema),
    codeResults: z.array(chunkSchema).optional(),
});
//# sourceMappingURL=ai.schema.js.map