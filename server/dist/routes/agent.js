//图每走一步就吐一个事件
//agent 节点的思考 token、
// tools 节点的工具调用参数、
// 工具返回结果。
//把 agent 工作流每一步产生的信息，挑选前端需要的内容发送
// 逐个作为事件传给调用方。
import express from 'express';
import { runAgent } from '../agent/graph';
import { agentRequestSchema } from '../schemas/search.schema';
import { AgentError } from '../agent/errors';
import { GraphRecursionError } from '@langchain/langgraph';
import { toToolErrorEvent } from '../agent/toolErrors';
const router = express.Router();
//Content - Type: text / event - stream
//sse响应头 
router.post('/', async (req, res) => {
    //断开取消链路
    const controller = new AbortController();
    const onClose = () => {
        //没调用end，相应没结束就断开
        if (!res.writableEnded) {
            controller.abort();
        }
    };
    try {
        //断开链路就中断
        res.once('close', onClose);
        //先校验请求
        const result = agentRequestSchema.safeParse(req.body);
        if (!result.success) {
            //这里输入不变,重试仍失效
            const message = result.error.issues.some(issue => issue.path[0] === 'sources')
                ? '用户选择的来源无效'
                : '用户输入无效';
            throw new AgentError('INVALID_INPUT', message, false);
            // throw new Error('传入agent路由的数据校验失败')
        }
        const { keyword, sources, ismd, isMap } = result.data;
        //设置流式响应头,这里只需要发送一次
        //响应头发给前端 前端更早进入读取状态
        //纯文本 utf-8编码
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        //不缓存这次响应 (流式内容实时生成)
        res.setHeader('Cache-Control', 'no-cache');
        //不要立即关闭tcp连接
        res.setHeader('Connection', 'keep-alive');
        //发送响应头
        res.flushHeaders();
        //流式返回 逐个获取并等待下一个值
        const stream = runAgent(keyword, sources, controller.signal, { ismd, isMap });
        for await (const state of stream) {
            //每个事件有独立的对象
            const frontData = { toolCall: [] };
            //确定消息属于哪个节点,然后再获取内容
            //llm节点
            if (state.agent) {
                const tip = state.agent.messages[0];
                if (!tip)
                    continue; //排除空值
                const calls = tip.tool_calls ?? []; //空值合并运算符
                if (calls.length > 0) {
                    frontData.toolCall = [...calls.map((call) => call.name)];
                    frontData.type = 'tool_call';
                }
                else {
                    frontData.type = 'answer';
                }
                frontData.content = tip.content;
            }
            //tool节点
            else if (state.tools) {
                for (const tip of state.tools.messages) {
                    const frontData = tip.status === 'error'
                        ? toToolErrorEvent(tip) //工具错误返回前端
                        : { toolCall: [] };
                    // 为当前工具结果创建独立事件
                    if (tip.status !== 'error') {
                        frontData.toolCall?.push(tip.name);
                        frontData.content = tip.content;
                        frontData.type = 'tool_result'; //工具返回结果
                    }
                    //每条工具结果都要发送一次
                    if (!controller.signal.aborted && !res.destroyed && !res.writableEnded) {
                        res.write(`data: ${JSON.stringify(frontData)} \n\n`);
                    }
                }
                continue; //发完之后不会执行公共回复
            }
            //连接没断开和连接没销毁和没调用end
            if (!controller.signal.aborted && !res.destroyed && !res.writableEnded) {
                res.write(`data: ${JSON.stringify(frontData)} \n\n`);
            }
            //公共回复
        }
        //后端done
        if (!controller.signal.aborted && !res.destroyed && !res.writableEnded) {
            const doneData = {
                toolCall: [],
                type: 'done',
                content: '处理完成'
            };
            // console.warn('后端发送done')
            res.write(`data: ${JSON.stringify(doneData)}\n\n`);
            res.end();
        }
        //这里流遍历结束
    }
    catch (error) {
        //判断响应阶段
        //判断未知错误,捕获超过最大步数限制
        const isTaskCancelled = controller.signal.aborted
            || (error instanceof Error && error.name === 'AbortError');
        const agentError = error instanceof AgentError
            ? error
            : isTaskCancelled
                ? new AgentError('TASK_CANCELLED', '任务已取消', false, error)
                : error instanceof GraphRecursionError
                    ? new AgentError('MAX_STEPS_EXCEEDED', 'Agent 执行步数已达上限', false, error)
                    : new AgentError('UNKNOWN_ERROR', '后端处理失败', false, error);
        //取消或者断开或者调用过end
        if (controller.signal.aborted || res.destroyed || res.writableEnded) {
            //3已经结束
            //记录日志
            console.error('响应已结束或连接已断开', agentError);
            //结束之后再抛出未知错误么?
            //这里记录后直接返回,不再抛出异常
            return;
        }
        //1没开始 
        else if (!res.headersSent) {
            //用户输入无效
            if (agentError.code === 'INVALID_INPUT') {
                res.status(400).json({
                    //这里把AgentError的属性传给前端
                    code: agentError.code,
                    message: agentError.message,
                    retryable: agentError.retryable,
                });
                return;
            }
            console.error('请求处理过程中出错', agentError);
            res.status(500).json({
                code: agentError.code,
                message: agentError.message,
                retryable: agentError.retryable,
            }); //普通json
        }
        //SSE已经开始,不能改变状态码
        //事件里携带错误内容
        else if (!res.writableEnded && !res.destroyed) {
            console.error('流式响应过程中出错', agentError);
            //发送错误事件
            res.write(`data: ${JSON.stringify({
                type: 'error', //frontData.type
                content: agentError.message,
                code: agentError.code,
                retryable: agentError.retryable,
            })}\n\n`);
            //结束响应
            res.end();
        }
    }
    finally {
        res.off('close', onClose);
    }
});
export default router;
//# sourceMappingURL=agent.js.map