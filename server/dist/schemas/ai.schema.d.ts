import { z } from "zod";
export declare const aiSchema: z.ZodObject<{
    keyword: z.ZodString;
    list: z.ZodArray<z.ZodObject<{
        ids: z.ZodString;
        content: z.ZodString;
        source: z.ZodString;
        title: z.ZodString;
        filePath: z.ZodString;
        type: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AI = z.infer<typeof aiSchema>;
//# sourceMappingURL=ai.schema.d.ts.map