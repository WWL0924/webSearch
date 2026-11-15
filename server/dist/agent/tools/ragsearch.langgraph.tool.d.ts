export declare const ragTool: import("@langchain/core/tools").DynamicStructuredTool<import("zod").ZodObject<{
    keyword: import("zod").ZodString;
    sources: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodEnum<{
        [x: string]: string;
    }>>>;
}, import("zod/v4/core").$strip>, {
    keyword: string;
    sources: string[];
}, {
    keyword: string;
    sources?: string[] | undefined;
}, import("@langchain/core/messages").ToolMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>> | {
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
}, unknown, "ragSearch">;
//# sourceMappingURL=ragsearch.langgraph.tool.d.ts.map