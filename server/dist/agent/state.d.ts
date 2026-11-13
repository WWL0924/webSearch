import type { BaseMessage } from '@langchain/core/messages';
export declare const AgentState: import("@langchain/langgraph").AnnotationRoot<{
    messages: import("@langchain/langgraph").BaseChannel<BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[], BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[] | import("@langchain/langgraph").OverwriteValue<BaseMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>, import("@langchain/core/messages").MessageType>[]>, unknown>;
    ismd: import("@langchain/langgraph").BaseChannel<boolean, boolean | import("@langchain/langgraph").OverwriteValue<boolean>, unknown>;
    isMap: import("@langchain/langgraph").BaseChannel<"auto" | "false" | "true", "auto" | "false" | "true" | import("@langchain/langgraph").OverwriteValue<"auto" | "false" | "true">, unknown>;
    sources: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
}>;
//# sourceMappingURL=state.d.ts.map