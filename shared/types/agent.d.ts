//返回前端的内容
export type AgentStreamEvent = {
  toolCall?: string[],//用到的工具名称
  content?: string | unknown[],
  type?: 'tool_call' | 'tool_result' | 'tool_error' | 'answer' | 'done' | 'error'//用途
  code?: string,
  retryable?: boolean,
}

//code
//1错误处于哪一类
export type AgentErrorCode =
  // 用户输入
  | 'INVALID_INPUT' //输入无效(source传入错误)

  // LLM 错误
  | 'LLM_REQUEST_FAILED' //回答失败
  | 'LLM_RATE_LIMIT' //模型服务限流(请求频繁超过服务商配额)
  | 'LLM_TIMEOUT' //超时
  | 'LLM_AUTH_FAILED' //模型服务鉴权失败或无访问权限
  | 'LLM_INVALID_REQUEST' //模型请求参数无效或模型不存在
  | 'LLM_INVALID_RESPONSE' //模型返回的内容不符合预期格式

  // Tool 错误
  | 'TOOL_NOT_FOUND' //查找工具时找不到
  | 'TOOL_EXECUTION_FAILED' //调用工具时 执行错误

  // RAG 错误
  | 'RETRIEVAL_FAILED' //检索失败
  | 'CHROMA_ERROR' //向量数据库错误
  | 'EMBEDDING_ERROR'//向量化错误
  | 'DOCUMENT_NOT_FOUND' //原始文档不存在
  | 'DOCUMENT_SECTION_NOT_FOUND' //文档中不存在指定章节

  // 网络错误
  | 'NETWORK_ERROR'  //网络错误
  | 'REQUEST_TIMEOUT' //回复超时

  // Agent 错误
  | 'MAX_STEPS_EXCEEDED' //超出最大执行步数
  | 'CONTEXT_LIMIT_EXCEEDED' //模型输入裁剪后仍超过预算
  | 'AGENT_EXECUTION_FAILED' //执行状态异常

  // 系统错误
  | 'FILE_OPERATION_FAILED'  //文件读写失败
  | 'REPORT_TOO_LARGE' //报告内容超过大小上限
  | 'RESPONSE_PARSE_ERROR' //前端无法解析响应数据
  | 'UNKNOWN_ERROR'  //未知错误

  | 'TASK_CANCELLED' //任务被取消
e

//message
export type messageType = string

//retryable
export type retryableType = boolean
