import { Annotation } from '@langchain/langgraph'; //定义状态字段
//创建使用状态
export const AgentState = Annotation.Root({
    //模型上下文
    messages: Annotation({
        //返回新消息的时候不覆盖旧消息
        reducer: (current, update) => current.concat(update),
        default: () => [] //初始值空数组
    }),
    //是否生成md
    ismd: Annotation({
        reducer: (_current, update) => update,
        default: () => false
    }),
    //是否生成思维导图
    isMap: Annotation({
        reducer: (_current, update) => update,
        default: () => 'auto'
    }),
    //检索来源
    sources: Annotation({
        reducer: (_current, update) => update, //覆盖更新
        default: () => []
    })
});
//# sourceMappingURL=state.js.map