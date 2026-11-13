import { type AgentTool } from '../types';
import { createMarkdownInputSchema, type createMarkdownOutputType } from '../../schemas/report.shcema';
declare const createTool: AgentTool<typeof createMarkdownInputSchema, createMarkdownOutputType>;
export default createTool;
//# sourceMappingURL=createmarkdown.tool.d.ts.map