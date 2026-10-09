import type { Search } from '../../schemas/search.schema.js';
type KeywordType = Search['keyword'];
declare function ragSearch(keyword: KeywordType, sources?: string[]): Promise<{
    noContent: boolean;
    resultList: import("../../types/rag.js").SearchResultItem[];
    codeResults: import("../../types/rag.js").SearchResultItem[];
}>;
export default ragSearch;
//# sourceMappingURL=ragSearch.d.ts.map