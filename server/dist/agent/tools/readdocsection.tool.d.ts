import { type AgentTool } from '../types';
import { readDocSectionInputSchema, type readDocSectionOutputType } from '../../schemas/read.schema';
declare const readTool: AgentTool<typeof readDocSectionInputSchema, readDocSectionOutputType>;
export default readTool;
//# sourceMappingURL=readdocsection.tool.d.ts.map