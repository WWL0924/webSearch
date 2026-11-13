import type { SearchResultItem } from '../../types/rag.js';
type RetriveType = {
    noContent: boolean;
    resultList: SearchResultItem[];
};
type CodeRetrieveOptions = {
    parentSectionIds: string[];
    sources?: string[];
};
declare function retrieve(embedding: number[], keyword: string, sources?: string[], signal?: AbortSignal): Promise<RetriveType>;
declare function retrieveCodeBySections({ parentSectionIds, sources }: CodeRetrieveOptions, signal?: AbortSignal): Promise<SearchResultItem[]>;
export { retrieveCodeBySections };
export default retrieve;
//# sourceMappingURL=retrieve.d.ts.map