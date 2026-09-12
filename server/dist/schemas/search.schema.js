//这里负责校验search的req
import { z } from "zod";
export const searchSchema = z.object({
    keyword: z.string(),
    sources: z.array((z.string())).optional() //这里可以允许多个来源
});
//# sourceMappingURL=search.schema.js.map