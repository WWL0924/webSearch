//Schema 校验、调用 Service、包装结果
import { z } from 'zod';
import {} from '../types';
import createMarkdown from '../../services/rag/createMarkdown';
import { createMarkdownInputSchema } from '../../schemas/report.shcema';
const createTool = {
    //这里命名和文件命名大小写是不是统一比较好
    name: 'createMarkdown',
    description: '根据搜索结果生成 Markdown 报告，并按 isMap 参数决定是否生成思维导图。keyword 是报告主题；textChunks 是相关文字切片；codeChunks 是相关代码切片；isMap 可设置为 true、false 或 auto。',
    inputSchema: createMarkdownInputSchema,
    //这里传入一个非立即执行函数
    execute: async (input) => await createMarkdown(input)
};
export default createTool;
//# sourceMappingURL=createmarkdown.tool.js.map