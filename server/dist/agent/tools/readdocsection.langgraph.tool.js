import { tool } from '@langchain/core/tools';
import readDocSection from '../../services/rag/readDocSection';
import { readDocSectionInputSchema } from '../../schemas/read.schema';
// ragSearch 和 ragSearchInputSchema 使用现有导入
export const readTool = tool(input => readDocSection(input), {
    name: 'readDocSection',
    description: 
    // 用途：先说场景，把工具定位成「补全」而不是「找资料」
    '读取指定文档全文或指定章节，用于在 ragSearch 已给出片段后补全上下文。filePath 是相对于文档根目录的路径，例如 vite/guide/why.md；section 可选，不提供时返回整个文档内容。'
        // 触发条件：上一版只写限制不写理由，导致模型干脆一次不用
        // 这里给三个可自检的信号，把「什么时候该读」说清楚
        + '出现以下任一情况时应当调用：片段内容被截断或明显不完整；片段里的表述需要对照上下文才能确认；'
        + '用户要的是某个功能的完整说明，而片段只覆盖其中一部分。'
        // 边界 1：路径来源，禁止试错
        + '调用前必须已有 ragSearch 结果：filePath 和 section 要来自检索片段，不能凭空猜测，也不要靠逐个试路径来找文档。'
        // 边界 2：section 优先，避免整篇拉取浪费上下文
        + '优先指定 section 只读需要的章节，只有确认需要通读全文时才省略 section。'
        // 边界 3：防过度钻取，但把停止条件交给「能否回答」而不是固定次数
        + '同一文件不重复读取同一个 section；当片段加已读章节足以回答问题、或已有材料相互印证时，直接给出答案，不要再调用工具。',
    schema: readDocSectionInputSchema
});
//# sourceMappingURL=readdocsection.langgraph.tool.js.map