import type { createMarkdownInputType } from '../../schemas/report.shcema.js';
type IsMapMode = createMarkdownInputType['isMap'];
declare function judjeIsmap(keyword: string, isMap?: IsMapMode): Promise<boolean>;
export default judjeIsmap;
//# sourceMappingURL=judjeIsmap.d.ts.map