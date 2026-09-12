import type { AI } from '../../schemas/ai.schema.js';
import type { Response } from "express";
type KeywordType = AI['keyword'];
type ListType = AI['list'];
declare function AIsummary(keyword: KeywordType, list: ListType, res: Response): Promise<void>;
export default AIsummary;
//# sourceMappingURL=AIsummary.d.ts.map