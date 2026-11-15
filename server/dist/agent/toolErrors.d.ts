import { ToolMessage } from '@langchain/core/messages';
import type { AgentStreamEvent } from '../../../shared/types/agent';
export declare function createToolErrorMessage(error: unknown, toolName: string, toolCallId: string): ToolMessage<import("@langchain/core/messages").MessageStructure<import("@langchain/core/messages").MessageToolSet>>;
export declare function toToolErrorEvent(message: ToolMessage): AgentStreamEvent;
//# sourceMappingURL=toolErrors.d.ts.map