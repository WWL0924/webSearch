import { ToolMessage } from '@langchain/core/messages';
import { AgentError } from './errors';
//错误整理成统一的toolMessage
export function createToolErrorMessage(error, toolName, toolCallId) {
    //保留已分类的错误,普通异常使用工具执行失败兜底
    const agentError = error instanceof AgentError
        ? error
        : new AgentError('TOOL_EXECUTION_FAILED', `${toolName} 工具执行失败`, false, error);
    //只传递可展示的错误信息,cause保留在后端日志中
    return new ToolMessage({
        name: toolName,
        tool_call_id: toolCallId,
        status: 'error',
        content: JSON.stringify({
            code: agentError.code,
            message: agentError.message,
            retryable: agentError.retryable,
        }),
    });
}
//进入工具函数之前就被捕获,错误存在toolMessage.content
export function toToolErrorEvent(message) {
    const event = {
        type: 'tool_error',
        toolCall: message.name ? [message.name] : [],
        content: typeof message.content === 'string' ? message.content : '工具执行失败',
        code: 'TOOL_EXECUTION_FAILED',
        retryable: false,
    };
    if (typeof message.content !== 'string')
        return event;
    try {
        //再次转换为对象
        const details = JSON.parse(message.content);
        if (typeof details === 'object' && details !== null &&
            'code' in details && typeof details.code === 'string' &&
            'message' in details && typeof details.message === 'string' &&
            'retryable' in details && typeof details.retryable === 'boolean') {
            event.code = details.code;
            event.content = details.message;
            event.retryable = details.retryable;
        }
    }
    catch {
        //普通文本错误直接使用兜底事件
    }
    return event;
}
//# sourceMappingURL=toolErrors.js.map