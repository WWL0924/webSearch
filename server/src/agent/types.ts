//定义工具输入和输出,AgentToolResult、AgentTool 接口


import { z } from 'zod'


export type AgentTool<
//
  TSchema extends z.ZodType,
  TOutput
> = {
  name: string //工具名称
  description: string //给llm看的说明
  inputSchema: TSchema //参数校验规则
  execute: ( //执行
    input: z.output<TSchema> //输入
  )
    
    //输出可能是异步 可能是同步
    => Promise<TOutput> | TOutput //输出由代码控制,只需要ts编译时检查
}