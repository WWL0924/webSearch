import { tool } from '@langchain/core/tools';
import ragSearch from '../../services/rag/ragSearch';
import { ragSearchInputSchema } from '../../schemas/search.schema';
// ragSearch 和 ragSearchInputSchema 使用现有导入
export const ragSearchTool = tool(input => ragSearch(input), {
    name: 'ragSearch',
    description: '根据关键词搜索相关文档内容。keyword 是必填的搜索关键词；sources 可选，用于限制搜索来源。返回匹配的文档片段和相关代码结果。',
    schema: ragSearchInputSchema
});
//# sourceMappingURL=regsearch.langgraph.tool.js.map