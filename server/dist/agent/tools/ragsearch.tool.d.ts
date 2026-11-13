import { type AgentTool } from '../types';
import { ragSearchInputSchema, type ragSearchOutputType } from '../../schemas/search.schema';
declare const ragTool: AgentTool<typeof ragSearchInputSchema, ragSearchOutputType>;
export default ragTool;
//# sourceMappingURL=ragsearch.tool.d.ts.map