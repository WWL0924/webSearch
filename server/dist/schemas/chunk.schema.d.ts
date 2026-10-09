import { z } from "zod";
export declare const chunkSchema: z.ZodObject<{
    ids: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    source: z.ZodString;
    title: z.ZodString;
    section: z.ZodString;
    sourceUrl: z.ZodString;
    filePath: z.ZodOptional<z.ZodString>;
    chunkIndex: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodString>;
    parentSectionId: z.ZodOptional<z.ZodString>;
    lang: z.ZodOptional<z.ZodString>;
    distances: z.ZodOptional<z.ZodNumber>;
    rankScore: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type ChunkItem = z.infer<typeof chunkSchema>;
//# sourceMappingURL=chunk.schema.d.ts.map