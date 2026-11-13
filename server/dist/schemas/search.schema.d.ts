import { z } from "zod";
export declare const ragSearchInputSchema: z.ZodObject<{
    keyword: z.ZodString;
    sources: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        [x: string]: string;
    }>>>;
}, z.core.$strip>;
export declare const agentRequestSchema: z.ZodObject<{
    keyword: z.ZodString;
    sources: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        [x: string]: string;
    }>>>;
    ismd: z.ZodDefault<z.ZodBoolean>;
    isMap: z.ZodDefault<z.ZodEnum<{
        auto: "auto";
        false: "false";
        true: "true";
    }>>;
}, z.core.$strip>;
export declare const ragResultItemSchema: z.ZodObject<{
    content: z.ZodString;
    title: z.ZodString;
    filePath: z.ZodString;
    sourceUrl: z.ZodString;
    score: z.ZodNumber;
    source: z.ZodString;
    section: z.ZodString;
}, z.core.$strip>;
export declare const ragCodeResultItemSchema: z.ZodObject<{
    content: z.ZodString;
    title: z.ZodString;
    sourceUrl: z.ZodString;
    source: z.ZodString;
    lang: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ragSearchOutputSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodObject<{
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
        textChunkCount: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ragResultItemType = z.infer<typeof ragResultItemSchema>;
export type ragCodeResultItemType = z.infer<typeof ragCodeResultItemSchema>;
export type ragSearchInputType = z.infer<typeof ragSearchInputSchema>;
export type ragSearchOutputType = z.infer<typeof ragSearchOutputSchema>;
//# sourceMappingURL=search.schema.d.ts.map