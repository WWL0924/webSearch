//检索结果块的共享结构:ragSearch 出口与 /ai 入口共用
import { z } from "zod";
export const chunkSchema = z.object({
    //两侧都需要的展示字段
    ids: z.string().optional(),
    content: z.string(),
    source: z.string(),
    title: z.string(),
    section: z.string(),
    sourceUrl: z.string(),
    //检索侧内部用:去重、查关联代码
    filePath: z.string().optional(),
    chunkIndex: z.number().optional(),
    type: z.string().optional(),
    parentSectionId: z.string().optional(),
    lang: z.string().optional(),
    //只有检索输出带,前端排序/展示用,总结侧不传
    distances: z.number().optional(),
    rankScore: z.number().optional(),
});
//# sourceMappingURL=chunk.schema.js.map