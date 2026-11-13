//返回前端的内容
export type AgentStreamEvent = {
  toolCall?: string[],//用到的工具名称
  content?: string | unknown[],
  type?: 'tool_call' | 'tool_result' | 'tool_error' | 'answer' | 'done' | 'error'//用途
  code?: string,
  retryable?: boolean,
}
