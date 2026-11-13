export declare const readTool: import("@langchain/core/tools").DynamicStructuredTool<import("zod").ZodObject<{
    filePath: import("zod").ZodString;
    section: import("zod").ZodOptional<import("zod").ZodString>;
}, import("zod/v4/core").$strip>, {
    filePath: string;
    section?: string | undefined;
}, {
    filePath: string;
    section?: string | undefined;
}, {
    content: string;
    filePath: string;
    section: string | null;
}, unknown, "readDocSection">;
//# sourceMappingURL=readdocsection.langgraph.tool.d.ts.map