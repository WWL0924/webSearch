import { z } from "zod";
export declare const report: z.ZodObject<{
    title: z.ZodString;
    task: z.ZodString;
    conclusion: z.ZodString;
    analysis: z.ZodString;
    sourceMarkdown: z.ZodString;
    code: z.ZodString;
}, z.core.$strip>;
export declare const createMarkdownInput: z.ZodObject<{
    keyword: z.ZodString;
    isMap: z.ZodDefault<z.ZodEnum<{
        auto: "auto";
        false: "false";
        true: "true";
    }>>;
}, z.core.$strip>;
export declare const judgeIsMapOutput: z.ZodObject<{
    isMap: z.ZodBoolean;
}, z.core.$strip>;
export type Report = z.infer<typeof report>;
//# sourceMappingURL=report.shcema.d.ts.map