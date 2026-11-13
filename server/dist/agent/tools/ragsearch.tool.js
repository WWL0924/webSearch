import { z } from 'zod';
import {} from '../types';
import { ragSearchInputSchema } from '../../schemas/search.schema';
import ragSearch from '../../services/rag/ragSearch';
const ragTool = {
    name: 'ragSearch',
    description: '根据关键词搜索相关文档内容。keyword 是必填的搜索关键词；sources 可选，用于限制搜索来源。返回匹配的文档片段和相关代码结果。',
    inputSchema: ragSearchInputSchema,
    execute: async (input) => await ragSearch(input)
};
export default ragTool;
//# sourceMappingURL=ragsearch.tool.js.map