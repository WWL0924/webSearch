export declare const tools: (import("../types").AgentTool<import("zod").ZodObject<{
    keyword: import("zod").ZodString;
    sources: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodEnum<{
        [x: string]: string;
    }>>>;
}, import("zod/v4/core").$strip>, {
    success: boolean;
    data: {
        textChunks: {
            content: string;
            title: string;
            filePath: string;
            sourceUrl: string;
            score: number;
            source: string;
            section: string;
        }[];
        codeChunks: {
            content: string;
            title: string;
            sourceUrl: string;
            source: string;
            lang?: string | undefined;
        }[];
        textChunkCount: number;
    };
}> | import("../types").AgentTool<import("zod").ZodObject<{
    keyword: import("zod").ZodString;
    isMap: import("zod").ZodDefault<import("zod").ZodEnum<{
        auto: "auto";
        false: "false";
        true: "true";
    }>>;
    textChunks: import("zod").ZodArray<import("zod").ZodObject<{
        content: import("zod").ZodString;
        title: import("zod").ZodString;
        filePath: import("zod").ZodString;
        sourceUrl: import("zod").ZodString;
        score: import("zod").ZodNumber;
        source: import("zod").ZodString;
        section: import("zod").ZodString;
    }, import("zod/v4/core").$strip>>;
    codeChunks: import("zod").ZodArray<import("zod").ZodObject<{
        content: import("zod").ZodString;
        title: import("zod").ZodString;
        sourceUrl: import("zod").ZodString;
        source: import("zod").ZodString;
        lang: import("zod").ZodOptional<import("zod").ZodString>;
    }, import("zod/v4/core").$strip>>;
}, import("zod/v4/core").$strip>, {
    mdFileName: string;
    mapFileName: string | null;
}> | import("../types").AgentTool<import("zod").ZodObject<{
    filePath: import("zod").ZodString;
    section: import("zod").ZodOptional<import("zod").ZodString>;
}, import("zod/v4/core").$strip>, {
    content: string;
    filePath: string;
    section: string | null;
}>)[];
//# sourceMappingURL=index.d.ts.map