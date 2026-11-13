import { z } from 'zod';
import {} from '../types';
import readDocSection from '../../services/rag/readDocSection';
import { readDocSectionInputSchema } from '../../schemas/read.schema';
const readTool = {
    //这里命名和文件命名大小写是不是统一比较好
    name: 'readDocSection',
    description: '读取指定文档的内容或指定章节。filePath 是相对于文档根目录的路径；section 可选，不提供时返回整个文档内容。',
    inputSchema: readDocSectionInputSchema,
    //这里传入一个非立即执行函数
    execute: async (input) => readDocSection(input)
};
export default readTool;
//# sourceMappingURL=readdocsection.tool.js.map