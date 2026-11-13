//agent状态
import type { BaseMessage } from '@langchain/core/messages'//LangChain 定义的基础消息类型
import { Annotation } from '@langchain/langgraph'//定义状态字段

//创建使用状态
export const AgentState = Annotation.Root({ //组合多个状态字段
  //模型上下文
  messages: Annotation<BaseMessage[]>({ //定义 messages 字段的更新规则
    //返回新消息的时候不覆盖旧消息
    reducer: (current, update) => current.concat(update),
    default: () => [] //初始值空数组
  }),
  //是否生成md
  ismd: Annotation<boolean>({
    reducer: (_current, update) => update,
    default: () => false
  }),
  //是否生成思维导图
  isMap: Annotation<'true' | 'false' | 'auto'>({
    reducer: (_current, update) => update,
    default: () => 'auto'
  }),
  //检索来源
  sources: Annotation<string[]>({
    reducer: (_current, update) => update,//覆盖更新
    default: () => []
  })

})
