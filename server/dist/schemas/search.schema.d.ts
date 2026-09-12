import { z } from "zod";
export declare const searchSchema: z.ZodObject<{
    keyword: z.ZodString;
    sources: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type Search = z.infer<typeof searchSchema>;
//# sourceMappingURL=search.schema.d.ts.map