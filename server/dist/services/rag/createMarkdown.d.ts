import type { AI } from '../../schemas/ai.schema.js';
type chunkListType = AI['list'];
declare function createMarkdown(isMap: string | undefined, keyword: string, list: chunkListType, codeResults?: chunkListType): Promise<{
    mdFileName: string;
    mapFileName: string | null;
}>;
export default createMarkdown;
//# sourceMappingURL=createMarkdown.d.ts.map