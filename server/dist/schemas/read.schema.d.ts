import { z } from "zod";
export declare const readDocSectionInputSchema: z.ZodObject<{
    filePath: z.ZodString;
    section: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const readDocSectionOutputSchema: z.ZodObject<{
    content: z.ZodString;
    filePath: z.ZodString;
    section: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type readDocSectionInputType = z.infer<typeof readDocSectionInputSchema>;
export type readDocSectionOutputType = z.infer<typeof readDocSectionOutputSchema>;
//# sourceMappingURL=read.schema.d.ts.map