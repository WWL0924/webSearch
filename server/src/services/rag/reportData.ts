//llm生成结构化数据
import OpenAI from 'openai';
import { type Report, report } from '../../schemas/report.shcema.js'
import type { AI } from '../../schemas/ai.schema.js'
import { env } from '../../config/env.js'

type chunkListType = AI['list']


//创建客户端
const client = new OpenAI({
  // 必须指定阿里云的兼容接口地址
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  // key
  apiKey: env.DASHSCOPE_API_KEY,
});

async function reportData(keyword: string, list: chunkListType, codeResults: chunkListType = []): Promise<Report> {

  const contentArr = list.map(item => {
    return item.content
  })

  const prompt = `
# 角色
你是技术文档报告生成助手。请根据用户问题和提供的相关上下文，生成一份结构化报告数据。

# 用户原始问题
${keyword}

# 相关上下文
${contentArr.join('\n\n--- 上下文片段分隔线 ---\n\n')}

# 任务要求
1. 只能依据上方提供的相关上下文，不得补充、猜测或编造上下文中没有的信息。
2. 如果上下文不足以回答问题，请在 conclusion 和 analysis 中明确说明缺少哪些信息。
3. title：根据用户问题提炼一个简短、明确的技术报告标题，不要直接复制完整问题。
4. task：原样保留用户原始问题，不得改写或省略。
5. conclusion：直接回答用户问题，概括最重要的结论，保持简洁准确。
6. analysis：结合相关上下文说明结论依据、关键步骤和需要注意的限制。
7. sourceMarkdown：整理实际支持结论的上下文内容，使用 Markdown 列表；不要收录与结论无关的片段，也不要虚构来源信息。
8. 必须只返回一个合法 JSON 对象，不要使用 Markdown 代码块，不要添加解释、前缀或后缀。
9. JSON 必须包含且只能包含以下字段，所有字段值必须是字符串：
{
  "title": "简短的报告标题",
  "task": "用户原始问题",
  "conclusion": "报告结论",
  "analysis": "结论依据和分析",
}
`

  const res = await client.responses.create({
    //模型
    model: 'qwen3.8-flash',
    input: prompt,
  })
  const res1 = JSON.parse(res.output_text)

  //来源,list里不会再混入代码片段,不用过滤type
  res1.sourceMarkdown = list
    .map(item => `- 文档：${item.title}\n  - 章节：${item.section}\n  - 原文：${item.content}\n  - 官方来源：${item.sourceUrl}`)
    .join('\n\n')

  //代码单独来自codeResults,和AIsummary保持同一套来源
  res1.code = codeResults
    .map(item => {
      const source = item.sourceUrl
        ? `[${item.title}](${item.sourceUrl})`
        : item.title
      return `### ${item.title}\n\n- 章节：${item.section}\n- 官方来源：${source}\n\n\`\`\`${item.lang ?? ''}\n${item.content}\n\`\`\``
    })
    .join('\n\n')

  //zod校验
  const res2 = report.parse(res1)
  console.log('$$$$$$$reportdata生成的结构数据', res2)
  return res2

}

export default reportData
// reportData('hooks是什么', [
//   {
//     ids: 'rules\\rules-of-hooks.md#0',
//     content: '<Intro>\n' +
//       'Hook 是使用 JavaScript 函数定义的，但它们代表了一种特殊的可重用的 UI 逻辑，并且对它们可以被调用的位置有限制。\n' +
//       '</Intro>\n' +
//       '\n' +
//       '<InlineToc />\n' +
//       '\n' +
//       '---',
//     source: 'data\\docs\\react',
//     title: 'Hook 的规则',
//     section: 'Document',
//     sourceUrl: 'https://react.dev/reference/rules/rules-of-hooks',
//     filePath: 'rules\\rules-of-hooks.md',
//     chunkIndex: 0,
//     type: 'section'
//   },
//   {
//     ids: 'react\\hooks.md#8',
//     content: 'Effect 允许组件 [连接到外部系统并与之同步](/learn/synchronizing-with-effects)。这包括处理网络、浏览器、DOM、动画、使用不同 UI 库编写的小部件以及其他非 React 代码。',
//     source: 'data\\docs\\react',
//     title: 'React 内置 Hook',
//     section: 'Effect Hook {/*effect-hooks*/}',
//     sourceUrl: 'https://react.dev/reference/react/hooks',
//     filePath: 'react\\hooks.md',
//     chunkIndex: 8,
//     type: 'paragraph'
//   }
// ])
