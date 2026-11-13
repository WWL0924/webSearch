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
            throw new Error('传入agent路由的数据校验失败');
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
        const stream = await runAgent(keyword, sources, controller.signal, { ismd, isMap });
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
                    const frontData = { toolCall: [] };
                    // 为当前工具结果创建独立事件
                    frontData.toolCall?.push(tip.name);
                    frontData.content = tip.content;
                    frontData.type = 'tool_result'; //工具返回结果
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
        //取消或者断开或者调用过end
        if (controller.signal.aborted || res.destroyed || res.writableEnded) {
            return;
        }
        //1没开始 
        else if (!res.headersSent) {
            //普通错误返回
            //请求校验失败,用户输入错误
            const invalidInput = new AgentError('INVALID_INPUT', '用户请求校验失败', true);
            console.error('---------------响应还没开始', error);
            res.status(500).json(['后端返回失败', '错误' + error]); //普通json
        }
        else if (!res.writableEnded && !res.destroyed) {
            console.error('流式响应过程中出错', error);
            //发送错误事件
            res.write(`data: ${JSON.stringify({
                type: 'error', //frontData.type
                content: '后端处理失败，请稍后重试'
            })}\n\n`);
            //结束响应
            res.end();
        }
        //3已经结束
        else if (res.writableEnded || res.destroyed) {
            //记录日志
            console.error('响应已结束或连接已断开', error);
        }
    }
    finally {
        res.off('close', onClose);
    }
});
export default router;
//# sourceMappingURL=agent.js.map