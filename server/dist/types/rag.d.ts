type Chunk = {
    content: string;
    metadata: ChunkMetadata;
    id?: string;
    chunksIndex?: number;
};
type IndexedChunk = Omit<Chunk, 'id' | 'chunksIndex'> & {
    id: string;
    chunksIndex: number;
};
type ChunkWithEmbedding = IndexedChunk & {
    embedding: number[];
};
type ChunksWithEmbedding = ChunkWithEmbedding[];
type ChromaChunks = ChunkWithEmbedding;
type SearchResultItem = {
    ids: string | null | undefined;
    content: string | null | undefined;
    source: string;
    title: string;
    section: string;
    sourceUrl: string;
    filePath: string;
    chunkIndex: number;
    type: string;
    parentSectionId: string;
    lang?: string;
    distances: number;
    rankScore: number;
};
type ChunkMetadata = {
    source: string;
    filePath: string;
    title: string;
    section: string;
    sourceUrl: string;
    chunkIndex: number;
    type: string;
    length: number;
    parentSectionId: string;
    lang?: string;
};
export type { ChromaChunks, Chunk, IndexedChunk, ChunksWithEmbedding, ChunkWithEmbedding, SearchResultItem, ChunkMetadata };
//# sourceMappingURL=rag.d.ts.map