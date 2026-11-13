import { ToolNode } from '@langchain/langgraph/prebuilt'
import { langgraphTools } from '../tools/index.langgraph'

//创建ToolNode实例
export const executeTools = new ToolNode(langgraphTools)
//默认handleToolErrors: true：工具不存在、参数校验失败、执行抛异常，通常都会被内部捕获，转成错误 ToolMessage 返回给模型