export declare const createTool: import("@langchain/core/tools").DynamicStructuredTool<import("zod").ZodObject<{
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
    keyword: string;
    isMap: "auto" | "false" | "true";
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
}, {
    keyword: string;
    isMap?: "auto" | "false" | "true" | undefined;
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
}, import("@langchain/core/messages").ToolMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>> | {
    mdFileName: string;
    mapFileName: string | null;
}, unknown, "createMarkdown">;
//# sourceMappingURL=createmarkdown.langgraph.tool.d.ts.map