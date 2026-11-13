import { tool, type ToolRuntime } from '@langchain/core/tools'
import createMarkdown from '../../services/rag/createMarkdown'
import { createMarkdownInputSchema, type createMarkdownOutputType } from '../../schemas/report.shcema'
import type { AgentState } from '../state'
import { createToolErrorMessage } from '../toolErrors'

// ragSearch 和 ragSearchInputSchema 使用现有导入
export const createTool = tool(
  async (input, runtime: ToolRuntime<typeof AgentState.State>) => {
    try {
      if (!runtime.state.ismd) {
        throw new Error('用户未选择生成 Markdown 报告')
      }
      return await createMarkdown({ ...input, isMap: runtime.state.isMap }, runtime.signal)

    } catch (error) {
      console.error('createMarkdown 工具执行失败', error)
      runtime.signal?.throwIfAborted()
      return createToolErrorMessage(error, 'createMarkdown', runtime.toolCallId)
    }
  },
  {
    name: 'createMarkdown',
    description:
      // 用途：定义成流程的终点，明确何时才轮到它
      '把已检索到的资料整理成 Markdown 报告文件，是回答「生成报告/整理成文档」类需求的最后一步。'
      + 'keyword 是报告主题；textChunks 是 ragSearch 返回的 data.textChunks 文字切片数组；codeChunks 是 ragSearch 返回的 data.codeChunks 代码切片数组。'
      // 边界 1：results 非空、原样透传，避免模型编造或漏字段
      + 'textChunks 必须直接使用 ragSearch 返回的 data.textChunks，不要自己编写或删改片段内容；textChunks 为空时不要调用本工具。'
      // 边界 2：isMap 取值与文件落盘位置
      + 'isMap 取值只能是小写字符串 auto、true 或 false，auto 表示由系统判断是否需要思维导图。'
      + '报告会写入服务器报告目录，返回值 mdFileName 和 mapFileName 是文件名，不是可访问链接，不要向用户拼装下载地址。'
      // 边界 3：只调一次
      + '同一次对话只调用一次，不要在回答中重复生成报告。',
    schema: createMarkdownInputSchema
  }
)
