import type { SearchResultItem } from '../../types/rag.js';
type RetriveType = {
    noContent: boolean;
    resultList: SearchResultItem[];
};
type CodeRetrieveOptions = {
    parentSectionIds: string[];
    sources?: string[];
};
declare function retrieve(embedding: number[], keyword: string, sources?: string[]): Promise<RetriveType>;
declare function retrieveCodeBySections({ parentSectionIds, sources }: CodeRetrieveOptions): Promise<SearchResultItem[]>;
export { retrieveCodeBySections };
export default retrieve;
//# sourceMappingURL=retrieve.d.ts.map