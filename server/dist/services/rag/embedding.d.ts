import type { IndexedChunk, ChunkWithEmbedding } from '../../types/rag.js';
declare function embeddingChunks(chunks: IndexedChunk[]): Promise<ChunkWithEmbedding[]>;
declare function embeddingKeywords(keywords: string, signal?: AbortSignal): Promise<number[]>;
export { embeddingChunks, embeddingKeywords };
//# sourceMappingURL=embedding.d.ts.map