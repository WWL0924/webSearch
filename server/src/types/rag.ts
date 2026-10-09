//rag相关类型


//0刚切好的chunk
type Chunk = {
  content: string
  metadata: ChunkMetadata
  id?: string
  chunksIndex?: number
}

type IndexedChunk = Omit<Chunk, 'id' | 'chunksIndex'> & {
  id: string
  chunksIndex: number
}

//1待入库的chunk对象数组
type ChunkWithEmbedding = IndexedChunk & {
  embedding: number[]
}

type ChunksWithEmbedding = ChunkWithEmbedding[]


type ChromaChunks = ChunkWithEmbedding


//2检索后返回前端的结果
type SearchResultItem = {
  ids: string | null | undefined
  content: string | null | undefined
  source: string
  title: string
  section: string
  sourceUrl: string
  filePath: string
  chunkIndex: number
  type: string
  parentSectionId: string
  lang?: string
  distances: number
  rankScore: number
}

//3metadata对象的类型
type ChunkMetadata = {
  source: string
  filePath: string
  title: string
  section: string
  sourceUrl: string
  chunkIndex: number
  type: string
  length: number
  parentSectionId: string
  lang?: string
}


export type { ChromaChunks, Chunk, IndexedChunk, ChunksWithEmbedding, ChunkWithEmbedding, SearchResultItem, ChunkMetadata }
