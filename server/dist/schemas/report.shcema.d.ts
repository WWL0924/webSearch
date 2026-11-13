import { z } from "zod";
export declare const Report: z.ZodObject<{
    title: z.ZodString;
    task: z.ZodString;
    conclusion: z.ZodString;
    analysis: z.ZodString;
    sourceMarkdown: z.ZodString;
    code: z.ZodString;
}, z.core.$strip>;
export declare const createMarkdownInputSchema: z.ZodObject<{
    keyword: z.ZodString;
    isMap: z.ZodDefault<z.ZodEnum<{
        auto: "auto";
        false: "false";
        true: "true";
    }>>;
    textChunks: z.ZodArray<z.ZodObject<{
        content: z.ZodString;
        title: z.ZodString;
        filePath: z.ZodString;
        sourceUrl: z.ZodString;
        score: z.ZodNumber;
        source: z.ZodString;
        section: z.ZodString;
    }, z.core.$strip>>;
    codeChunks: z.ZodArray<z.ZodObject<{
        content: z.ZodString;
        title: z.ZodString;
        sourceUrl: z.ZodString;
        source: z.ZodString;
        lang: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const judgeIsMapOutput: z.ZodObject<{
    isMap: z.ZodBoolean;
}, z.core.$strip>;
export declare const createMarkdownOutputSchema: z.ZodObject<{
    mdFileName: z.ZodString;
    mapFileName: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type Report = z.infer<typeof Report>;
export type createMarkdownInputType = z.infer<typeof createMarkdownInputSchema>;
export type createMarkdownOutputType = z.infer<typeof createMarkdownOutputSchema>;
//# sourceMappingURL=report.shcema.d.ts.map