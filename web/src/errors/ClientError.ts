//后端错误信息类型AgentError
import type { AgentErrorCode, messageType, retryableType } from '../../../shared/types/agent'

export class ClientError extends Error {
  code: AgentErrorCode //错误码
  retryable: retryableType//重试是否可能成功
  constructor(
    code: AgentErrorCode, //错误码
    message: messageType, //错误描述
    retryable: retryableType,//重试是否可能成功
    cause?: unknown //描述操作失败
  ) {
    super(message, { cause })
    this.code = code
    this.retryable = retryable
    this.name = "ClientError"
  }
}