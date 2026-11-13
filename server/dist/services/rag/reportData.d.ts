import { Report } from '../../schemas/report.shcema.js';
import { type ragResultItemType, type ragCodeResultItemType } from '../../schemas/search.schema.js';
declare function reportData(keyword: string, list: ragResultItemType[], codeResults: ragCodeResultItemType[], signal?: AbortSignal): Promise<Report>;
export default reportData;
//# sourceMappingURL=reportData.d.ts.map