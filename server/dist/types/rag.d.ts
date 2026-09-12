type Chunk = {
    content: string;
    metadata: ChunkMetadata;
    id?: string;
    chunksIndex?: number;
};
type ChunkWithEmbedding = Chunk & {
    embedding: number[];
};
type ChunksWithEmbedding = ChunkWithEmbedding[];
type ChromaChunks = {
    content: string;
    metadata: ChunkMetadata;
    id: string;
    chunksIndex?: number;
    embedding: number[];
};
type SearchResultItem = {
    ids: string | null | undefined;
    content: string | null | undefined;
    source: string;
    title: string;
    filePath: string;
    type: string;
    distances: number;
    rankScore: number;
};
type ChunkMetadata = {
    source: string;
    filePath: string;
    title: string;
    type: string;
    length: number;
};
export type { ChromaChunks, Chunk, ChunksWithEmbedding, ChunkWithEmbedding, SearchResultItem, ChunkMetadata };
//# sourceMappingURL=rag.d.ts.map