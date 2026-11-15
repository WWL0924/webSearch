export class AgentError extends Error {
    code;
    retryable;
    constructor(code, //错误码
    message, //错误描述
    retryable, //重试是否可能成功
    cause //描述操作失败
    ) {
        super(message, { cause });
        this.code = code;
        this.retryable = retryable;
        this.name = "AgentError";
    }
}
//使用
// const error1 = new AgentError('RETRIEVAL_FAILED', '检索失败哦', true)
//# sourceMappingURL=errors.js.map