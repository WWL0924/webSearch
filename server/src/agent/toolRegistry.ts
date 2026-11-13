//统一注册三个工具
//给llm看的描述和参数schema 
import { type AgentTool } from './types.js'


//1注册工具
type RegisteredTool = AgentTool<any, any> //工具输入输出类型可能不同

const toolMap = new Map<string, RegisteredTool>()

//泛型函数,根据传入的tool自动推导
export function registerTool(tool: RegisteredTool) {
  if (toolMap.has(tool.name)) {
    throw new Error(`工具已存在：${tool.name}`)
  }
  toolMap.set(tool.name, tool)
}

//2取出工具名称说明参数规则给llm
export function getToolDefinitions() {
  return [...toolMap.values()].map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema //参数规则
  }))
}

//3调用对应工具
export async function executeTool(
  name: string,
  input: unknown
) {
  const tool = toolMap.get(name)

  if (!tool) {
    throw new Error(`未知工具：${name}`)
  }

  //先进行校验输入
  const parsedInput = tool.inputSchema.parse(input)
  //再执行工具
  return tool.execute(parsedInput)
}
