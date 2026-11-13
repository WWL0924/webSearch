//组装图
//生成工作流图
import { StateGraph, START, END } from "@langchain/langgraph";
//LangChain 提供的消息类
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { AgentState } from "./state";
import { executeTools } from "./nodes/executeTools";
import { ChatOpenAI } from "@langchain/openai";
import { langgraphTools } from "./tools/index.langgraph";
import { env } from "../config/env";
import { AgentError } from "./errors";
import { getRetryable } from "@langchain/core/errors";
// 初始化模型，绑定工具
const baseModel = new ChatOpenAI({
    model: "qwen3.8-flash",
    temperature: 0, //控制模型输出的随机性
    // apiKey: env.DASHSCOPE_API_KEY,
    apiKey: '123',
    configuration: {
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    },
});
const model = baseModel.bindTools(langgraphTools); //让模型知道哪些工具可以调用
const answerModel = baseModel.bindTools(langgraphTools.filter(tool => tool.name !== 'createMarkdown'));
//模型节点：调用 LLM，返回决策（回答或工具调用）
const LLMNode = async (state, config) => {
    //通过不同权限控制两种任务模式
    const activeModel = state.ismd ? model : answerModel;
    try {
        const response = await activeModel.invoke(state.messages, config.signal ? { signal: config.signal } : {});
        console.log('llm返回信息');
        return {
            messages: [response] // 返回 AIMessage（含 content 或 tool_calls）
        };
    }
    catch (error) {
        const providerError = typeof error === 'object' && error !== null
            ? error
            : {};
        const errorName = typeof providerError.name === 'string' ? providerError.name : '';
        const errorCode = typeof providerError.code === 'string' ? providerError.code : '';
        const status = typeof providerError.status === 'number' ? providerError.status : undefined;
        console.error('LLM节点调用失败', { name: errorName, status, code: errorCode });
        if (config.signal?.aborted || errorName === 'AbortError') {
            throw new AgentError('TASK_CANCELLED', '模型请求已取消', false);
        }
        const isTimeout = errorName === 'TimeoutError'
            || errorName === 'APIConnectionTimeoutError'
            || errorCode === 'ETIMEDOUT';
        const isRateLimit = status === 429
            || errorName === 'RateLimitError'
            || providerError.lc_error_code === 'MODEL_RATE_LIMIT';
        const isNetworkError = errorName === 'APIConnectionError'
            || ['ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND'].includes(errorCode);
        //取 LangChain 给异常加的重试标记
        const retryable = getRetryable(error)
            ?? (isTimeout || isNetworkError || isRateLimit || (status !== undefined && status >= 500));
        if (isRateLimit) {
            //这个需要前端提示用户稍后重试么?
            throw new AgentError('LLM_RATE_LIMIT', '模型服务限流，请稍后重试', retryable);
        }
        else if (isTimeout) {
            throw new AgentError('LLM_TIMEOUT', '模型回复超时', retryable);
        }
        else {
            throw new AgentError('LLM_REQUEST_FAILED', '模型请求失败', retryable);
        }
    }
};
// 路由函数：根据 LLM 输出决定下一步
const shouldContinue = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    // 如果最后一条消息有 tool_calls，去执行工具
    //这里还要表示消息类型是ai
    if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length) {
        console.log('执行工具');
        return "tools"; //执行tool节点
    }
    else {
        // 否则结束流程
        return END;
    }
};
const graph = new StateGraph(AgentState) //生成工作流图
    .addNode('agent', LLMNode) // LLM 决策节点
    .addNode('tools', executeTools) // 工具执行节点（已在 executeTools.ts 实现）
    .addEdge(START, "agent")
    .addConditionalEdges('agent', shouldContinue) // 根据是否有 tool_calls 路由
    .addEdge('tools', 'agent'); // 工具执行后回到 LLM
export const compiledGraph = graph.compile();
// 导出 invoke 函数供路由调用
export async function runAgent(question, sources, signal, options = { ismd: false, isMap: 'auto' }) {
    console.log('开始测试');
    //传入用户输入,运行图
    //图的流式接口,返回原始事件
    //在这里检查singal?
    return compiledGraph.stream(
    //图的初始状态
    {
        messages: [
            new SystemMessage(options.ismd
                ? '用户已选择生成 Markdown 报告。请先检索资料，有可用资料后调用 createMarkdown 生成报告，再给出最终回答；若无法获取资料或生成失败，请说明原因。'
                : '用户未选择生成 Markdown 报告。请直接回答问题，不生成报告文件。'),
            new HumanMessage(question)
        ],
        sources,
        ismd: options.ismd,
        isMap: options.isMap,
    }, 
    //执行配置
    {
        //图执行时向外输出的事件
        streamMode: "updates", //返回状态更新->节点级事件流,
        signal: signal
    });
}
//测试普通问答
// runAgent("你好，请简单介绍一下你自己")
//测试工具调用
// const stream = await runAgent("请使用知识库搜索 Vite 相关文档，找出 Vite 的开发服务器有什么特点。", ['vite'])
// for await (const update of stream) {
// console.dir(update, { depth: null })
// }
//# sourceMappingURL=graph.js.map