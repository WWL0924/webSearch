import { Card } from "antd"
import type { ResultItem } from '../../types/search'

interface ChunkCardProps {
  Chunk: ResultItem,
  index: number
}


function ChunkCard({ Chunk, index }: ChunkCardProps) {

  return (

    <Card
      size="small"
      style={{
        marginBottom: 16
      }}
      title={`第${index + 1}条`}
    >

      <ul>

        <li>
          文档标题：
          {Chunk.title}
        </li>

        <li>
          来源：
          {Chunk.source}
        </li>

        <li>
          类型：
          {Chunk.type}
        </li>

        <li>
          文本：
          {Chunk.content}
        </li>

      </ul>

    </Card>

  )
}

export default ChunkCard