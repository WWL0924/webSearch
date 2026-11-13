//组装图
//生成工作流图
import { StateGraph, START, END, GraphRecursionError } from "@langchain/langgraph";
//LangChain 提供的消息类
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import { AgentState } from "./state";
import { executeTools } from "./nodes/executeTools";
import { ChatOpenAI } from "@langchain/openai";
import { langgraphTools } from "./tools/index.langgraph";
import { env } from "../config/env";
import type { RunnableConfig } from "@langchain/core/runnables";
import { AgentError } from "./errors";
import { getRetryable } from "@langchain/core/errors";

//模型实际输入数
const limitToken = 12000

// 初始化模型，绑定工具
const baseModel = new ChatOpenAI({
  model: "qwen3.8-flash",
  temperature: 0, //控制模型输出的随机性
  apiKey: env.DASHSCOPE_API_KEY,
  // apiKey: '123',
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
});
const model = baseModel.bindTools(langgraphTools); //让模型知道哪些工具可以调用
const answerModel = baseModel.bindTools(langgraphTools.filter(tool => tool.name !== 'createMarkdown'));

//模型节点：调用 LLM，返回决策（回答或工具调用）
const LLMNode = async (state: typeof AgentState.State, config: RunnableConfig) => {
  //通过不同权限控制两种任务模式
  const activeModel = state.ismd ? model : answerModel;

  try {
    //限制模型实际输入量
    const messages = state.messages
    let inputMessage = messages
    const activeTools = state.ismd
      ? langgraphTools
      : langgraphTools.filter(tool => tool.name !== 'createMarkdown')
    const toolDefinitions = activeTools.map(tool => convertToOpenAITool(tool))

    //对整个message的token量进行估算
    const estimateInputTokens = async (candidate: typeof messages) => {
      const payload = {
        messages: candidate.map(message => ({
          role: message.getType(),
          content: message.content,
          name: message.name,
          additional_kwargs: message.additional_kwargs,
          tool_calls: message instanceof AIMessage ? message.tool_calls : undefined,
          tool_call_id: message instanceof ToolMessage ? message.tool_call_id : undefined,
        })),
        tools: toolDefinitions,
      }

      return Math.ceil(await baseModel.getNumTokens(JSON.stringify(payload)) * 1.1) + 256

      // //测试压缩功能
      // const testToken = [15000, 13000, 5000]
      // const token = testToken.pop()
      // if (token === undefined) {
      //   throw new Error('测试估算值已用完')
      // }
      // return token

    }

    let estimatedTokens = await estimateInputTokens(inputMessage)
    console.log('模型输入估算 token 数', estimatedTokens)

    if (estimatedTokens > limitToken) {
      //历史压缩
      //每轮工具交互从模型发起工具调用开始
      const roundStart = messages.flatMap((message, index) =>
        message instanceof AIMessage && message.tool_calls?.length
          ? [index]
          : []
      )

      let keepRound = Math.min(2, roundStart.length)//保存近两轮任务要求

      //持续压缩上下文
      while (estimatedTokens > limitToken && keepRound >= 1 && roundStart.length > keepRound) {
        const first = roundStart[0]!
        const keep = roundStart[roundStart.length - keepRound]!

        inputMessage = [
          ...messages.slice(0, first), //首次调用的任务
          ...messages.slice(keep) //保留最近两轮
        ]
        estimatedTokens = await estimateInputTokens(inputMessage)
        console.log('压缩后的上下文', inputMessage)
        keepRound -= 1
      }

    }

    //保留任务要求和最新完整工具轮次后仍超限,停止请求,避免继续发送超预算输入
    if (estimatedTokens > limitToken) {
      throw new AgentError('CONTEXT_LIMIT_EXCEEDED', '模型输入仍超过预算，请缩小问题范围或减少读取的资料', false)
    }

    config.signal?.throwIfAborted()
    const response = await activeModel.invoke(inputMessage, config.signal ? { signal: config.signal } : {});
    console.log('llm返回信息')

    return {
      messages: [response]  // 返回 AIMessage（含 content 或 tool_calls）
    };
  } catch (error) {
    if (error instanceof AgentError) throw error;

    const providerError = typeof error === 'object' && error !== null
      ? error as { name?: unknown; status?: unknown; code?: unknown; lc_error_code?: unknown }
      : {};
    const errorName = typeof providerError.name === 'string' ? providerError.name : '';
    const errorCode = typeof providerError.code === 'string' ? providerError.code : '';
    const status = typeof providerError.status === 'number' ? providerError.status : undefined;

    console.error('LLM节点调用失败', { name: errorName, status, code: errorCode });

    if (config.signal?.aborted || errorName === 'AbortError') {
      throw new AgentError('TASK_CANCELLED', '模型请求已取消', false, error);
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

    //根据状态码给模型服务错误分类
    if (status === 401 || status === 403) {
      throw new AgentError('LLM_AUTH_FAILED', '模型服务鉴权失败或无访问权限，请检查 API Key 和模型权限', false, error);
    }
    else if (status === 400 || status === 404 || status === 422) {
      throw new AgentError('LLM_INVALID_REQUEST', '模型请求参数无效，请检查模型名称和请求内容', false, error);
    }
    else if (isRateLimit) {
      throw new AgentError('LLM_RATE_LIMIT', '模型服务限流，请稍后重试', retryable, error);
    }
    else if (isTimeout) {
      throw new AgentError('LLM_TIMEOUT', '模型回复超时', retryable, error);
    }
    else if (isNetworkError) {
      throw new AgentError('NETWORK_ERROR', '无法连接模型服务，请检查网络后重试', retryable, error);
    }
    else {
      throw new AgentError('LLM_REQUEST_FAILED', '模型请求失败', retryable, error);
    }
  }

}

// 路由函数：根据 LLM 输出决定下一步
const shouldContinue = (state: typeof AgentState.State) => {
  const lastMessage = state.messages[state.messages.length - 1];
  // 如果最后一条消息有 tool_calls，去执行工具
  //这里还要表示消息类型是ai
  if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length) {
    console.log('执行工具')
    return "tools"; //执行tool节点
  }
  else {
    // 否则结束流程
    return END;

  }
}

const graph = new StateGraph(AgentState) //生成工作流图
  .addNode('agent', LLMNode)  // LLM 决策节点
  .addNode('tools', executeTools)  // 工具执行节点（已在 executeTools.ts 实现）
  .addEdge(START, "agent")
  .addConditionalEdges('agent', shouldContinue)  // 根据是否有 tool_calls 路由
  .addEdge('tools', 'agent')  // 工具执行后回到 LLM

export const compiledGraph = graph.compile();

// 导出 invoke 函数供路由调用
export async function* runAgent(
  question: string,
  sources: string[],
  signal: AbortSignal,
  options: { ismd: boolean; isMap: 'true' | 'false' | 'auto' } = { ismd: false, isMap: 'auto' }
) {
  console.log('开始测试')
  //传入用户输入,运行图
  //图的流式接口,返回原始事件
  //在这里检查singal?

  try {
    //拿到图的结果流
    const stream = await compiledGraph.stream(
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
        streamMode: "updates",//返回状态更新->节点级事件流,
        signal: signal,
        recursionLimit: 25

      }
    );
    for await (const updates of stream) {
      yield updates
    }
  } catch (error) {
    if (error instanceof AgentError) {
      throw error
    }

    //任务取消不归为图执行失败
    if (signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
      throw new AgentError('TASK_CANCELLED', '任务已取消', false, error)
    }

    //超过图执行步数上限
    if (error instanceof GraphRecursionError) {
      throw new AgentError('MAX_STEPS_EXCEEDED', 'Agent 执行步数已达上限', false, error)
    }

    //agent图的错误 执行状态异常
    throw new AgentError(
      'AGENT_EXECUTION_FAILED',
      'Agent 执行失败',
      false,
      error
    );
  }

}
//测试普通问答
// runAgent("你好，请简单介绍一下你自己")

//测试工具调用
// const stream = await runAgent("请使用知识库搜索 Vite 相关文档，找出 Vite 的开发服务器有什么特点。", ['vite'])

// for await (const update of stream) {
// console.dir(update, { depth: null })
// }
