import { tool, type ToolRuntime } from '@langchain/core/tools'
import ragSearch from '../../services/rag/ragSearch'
import { ragSearchInputSchema, type ragSearchOutputType } from '../../schemas/search.schema'
import type { AgentState } from '../state'
import { createToolErrorMessage } from '../toolErrors'


// ragSearch 和 ragSearchInputSchema 使用现有导入
export const ragTool = tool(
  //runtime工具执行信息包中读取运行中保存的用户来源(工具运行时上下文)
  async (input, runtime: ToolRuntime<typeof AgentState.State>) => {
    try {
      return await ragSearch({ ...input, sources: runtime.state.sources }, runtime.signal)

    } catch (error) {
      console.error('ragSearch 工具执行失败', error)
      runtime.signal?.throwIfAborted()
      return createToolErrorMessage(error, 'ragSearch', runtime.toolCallId)
    }
  },
  {
    name: 'ragSearch',
    description:
      // 用途：先讲能干什么，模型靠这句判断是否可用
      '根据关键词在官方文档知识库中检索相关片段，是获取信息的首选工具。keyword 是必填的搜索关键词；sources 可选，用于限制搜索来源，不传时自动识别。'
      // 边界：明确返回值的缺口，避免模型拿不到路径就自己猜
      + '返回内容中的每个文本片段包含 source、section、sourceUrl 和相对于文档根目录的真实 filePath。'
      + '需要看某片段的完整章节时，直接使用该文本片段返回的 filePath 和 section 调用 readDocSection；不得根据 sourceUrl 或 section 拼接、推测或改写 filePath。'
      // 边界：约束调用节奏，避免反复检索同一主题
      + '同一主题最多检索 1 至 2 次，关键词互补即可；已有足够片段时不要再检索。',
    schema: ragSearchInputSchema
  }
)
