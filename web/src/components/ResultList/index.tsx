import { Card } from 'antd'
import ChunkCard from './ChunkCard'


interface Chunk {
  ids: string,
  content: string
  source: string
  title: string
  filePath: string
  type: string
}


interface ResultListProps {
  list: Chunk[]
}

function ResultList({ list }: ResultListProps) {
  return (
    <Card
      title="向量数据库检索结果"
      style={{ width: 500 }}
    >

      {
        list.map((item, index) => (
          <ChunkCard Chunk={item} index={index} key={item.ids} />

        ))
      }
    </Card>
  )
}

export default ResultList
