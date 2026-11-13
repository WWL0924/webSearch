export declare const ragSearchTool: import("@langchain/core/tools").DynamicStructuredTool<import("zod").ZodObject<{
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
}, {
    success: boolean;
    data: {
        results: {
            content: string;
            title: string;
            sourceUrl: string;
            score: number;
            source: string;
            section: string;
        }[];
        codeResults: {
            content: string;
            title: string;
            sourceUrl: string;
            source: string;
            lang?: string | undefined;
        }[];
        totalResults: number;
    };
}, unknown, "ragSearch">;
//# sourceMappingURL=regsearch.langgraph.tool.d.ts.map