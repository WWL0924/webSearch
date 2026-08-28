//rag相关类型


//0刚切好的chunk
type Chunk = {
  content: string
  metadata: ChunkMetadata
  id?: string
  chunksIndex?: number
}

//1待入库的chunk对象数组
type ChunkWithEmbedding = Chunk & {
  embedding: number[]
}

type ChunksWithEmbedding = ChunkWithEmbedding[]


type ChromaChunks = {
  content: string
  metadata: ChunkMetadata
  id: string
  chunksIndex?: number,
  embedding: number[]
}


//2检索后返回前端的结果
type SearchResultItem = {
  ids: string | null | undefined
  content: string | null | undefined
  source: string
  title: string
  filePath: string
  type: string
  distances: number
  rankScore: number
}

//3metadata对象的类型
type ChunkMetadata = {
  source: string
  filePath: string
  title: string
  type: string
  length: number
}



export type { ChromaChunks, Chunk, ChunksWithEmbedding, ChunkWithEmbedding, SearchResultItem, ChunkMetadata }