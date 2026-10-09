import type { z } from 'zod';
import type { createMarkdownInput } from '../../schemas/report.shcema.js';
type IsMapMode = z.infer<typeof createMarkdownInput>['isMap'];
declare function judjeIsmap(keyword: string, isMap?: IsMapMode): Promise<boolean>;
export default judjeIsmap;
//# sourceMappingURL=judjeIsmap.d.ts.map