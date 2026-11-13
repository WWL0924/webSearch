export declare const compiledGraph: import("@langchain/langgraph").CompiledStateGraph<{
    messages: import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[];
    ismd: boolean;
    isMap: "auto" | "false" | "true";
    sources: string[];
}, {
    messages?: import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[] | import("@langchain/langgraph").OverwriteValue<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[]>;
    ismd?: boolean | import("@langchain/langgraph").OverwriteValue<boolean>;
    isMap?: "auto" | "false" | "true" | import("@langchain/langgraph").OverwriteValue<"auto" | "false" | "true">;
    sources?: string[] | import("@langchain/langgraph").OverwriteValue<string[]>;
}, "__start__" | "agent" | "tools", {
    messages: import("@langchain/langgraph").BaseChannel<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[], import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[] | import("@langchain/langgraph").OverwriteValue<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[]>, unknown>;
    ismd: import("@langchain/langgraph").BaseChannel<boolean, boolean | import("@langchain/langgraph").OverwriteValue<boolean>, unknown>;
    isMap: import("@langchain/langgraph").BaseChannel<"auto" | "false" | "true", "auto" | "false" | "true" | import("@langchain/langgraph").OverwriteValue<"auto" | "false" | "true">, unknown>;
    sources: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
}, {
    messages: import("@langchain/langgraph").BaseChannel<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[], import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[] | import("@langchain/langgraph").OverwriteValue<import("@langchain/core/messages").BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[]>, unknown>;
    ismd: import("@langchain/langgraph").BaseChannel<boolean, boolean | import("@langchain/langgraph").OverwriteValue<boolean>, unknown>;
    isMap: import("@langchain/langgraph").BaseChannel<"auto" | "false" | "true", "auto" | "false" | "true" | import("@langchain/langgraph").OverwriteValue<"auto" | "false" | "true">, unknown>;
    sources: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
}, import("@langchain/langgraph").StateDefinition, {
    agent: {
        messages: import("@langchain/core/messages").AIMessageChunk<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>>[];
    };
    tools: any;
}, unknown, unknown, []>;
export declare function runAgent(question: string, sources: string[], signal: AbortSignal, options?: {
    ismd: boolean;
    isMap: 'true' | 'false' | 'auto';
}): Promise<import("@langchain/core/utils/stream").IterableReadableStream<{
    agent?: {
        messages: import("@langchain/core/messages").AIMessageChunk<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>>[];
    };
    tools?: any;
}>>;
//# sourceMappingURL=graph.d.ts.map