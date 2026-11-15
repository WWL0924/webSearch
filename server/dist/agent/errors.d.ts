import type { AgentErrorCode, messageType, retryableType } from '../../../shared/types/agent';
export declare class AgentError extends Error {
    code: AgentErrorCode;
    retryable: retryableType;
    constructor(code: AgentErrorCode, //错误码
    message: messageType, //错误描述
    retryable: retryableType, //重试是否可能成功
    cause?: unknown);
}
//# sourceMappingURL=errors.d.ts.map