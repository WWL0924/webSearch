//定义统一错误类型
import type { AgentErrorCode, messageType, retryableType } from '../../../shared/types/agent'

export class AgentError extends Error {
  constructor(
    public code: AgentErrorCode, //错误码
    message: messageType, //错误描述
    public retryable: retryableType,//重试是否可能成功
    cause?: unknown //描述操作失败
  ) {
    super(message, { cause })
    this.name = "AgentError"
  }
}

//使用
// const error1 = new AgentError('RETRIEVAL_FAILED', '检索失败哦', true)
