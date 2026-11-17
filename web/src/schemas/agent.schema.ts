import { z } from 'zod'

//后端返回的数据,跨边界需要校验
export const agentStreamEventSchema = z.object({
  type: z.enum(['tool_call', 'tool_result', 'tool_error', 'answer', 'done', 'error']),
  toolCall: z.array(z.string()).optional(),
  content: z.union([z.string(), z.array(z.unknown())]).optional(),
  code: z.string().min(1).optional(),
  retryable: z.boolean().optional(),
}).superRefine((event, ctx) => {
  if (event.type === 'error' || event.type === 'tool_error') {
    if (typeof event.content !== 'string') {
      ctx.addIssue({ code: 'custom', path: ['content'], message: '错误事件必须包含字符串消息' })
    }
    if (event.code === undefined) {
      ctx.addIssue({ code: 'custom', path: ['code'], message: '错误事件必须包含错误码' })
    }
    if (event.retryable === undefined) {
      ctx.addIssue({ code: 'custom', path: ['retryable'], message: '错误事件必须包含重试标识' })
    }
  }
})
