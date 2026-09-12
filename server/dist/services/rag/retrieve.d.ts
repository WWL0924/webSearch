import type { SearchResultItem } from '../../types/rag.js';
type RetriveType = {
    noContent: boolean;
    resultList: SearchResultItem[];
};
declare function retrieve(embedding: number[], keyword: string, sources?: string[]): Promise<RetriveType>;
export default retrieve;
//# sourceMappingURL=retrieve.d.ts.map