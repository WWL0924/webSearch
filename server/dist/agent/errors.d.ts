export type AgentErrorCode = 'INVALID_INPUT' | 'LLM_REQUEST_FAILED' | 'LLM_RATE_LIMIT' | 'LLM_TIMEOUT' | 'TOOL_NOT_FOUND' | 'TOOL_EXECUTION_FAILED' | 'RETRIEVAL_FAILED' | 'CHROMA_ERROR' | 'NETWORK_ERROR' | 'REQUEST_TIMEOUT' | 'MAX_STEPS_EXCEEDED' | 'AGENT_EXECUTION_FAILED' | 'FILE_OPERATION_FAILED' | 'UNKNOWN_ERROR' | 'TASK_CANCELLED';
export declare class AgentError extends Error {
    code: AgentErrorCode;
    retryable: boolean;
    constructor(code: AgentErrorCode, //错误码
    message: string, //错误描述
    retryable: boolean);
}
//# sourceMappingURL=errors.d.ts.map