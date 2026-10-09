import { type Report } from '../../schemas/report.shcema.js';
import type { AI } from '../../schemas/ai.schema.js';
type chunkListType = AI['list'];
declare function reportData(keyword: string, list: chunkListType, codeResults?: chunkListType): Promise<Report>;
export default reportData;
//# sourceMappingURL=reportData.d.ts.map