import { Card } from "antd"
import type { ResultItem } from '../../../types/search'

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

      title={Chunk.type === 'code'
        ? `代码示例 ${index + 1}${Chunk.lang ? ` · ${Chunk.lang}` : ''}`
        : `第${index + 1}条`}
    >

      <ul>

        <li>
          文档标题：
          {Chunk.title}
        </li>

        <li>
          章节：
          {Chunk.section}
        </li>

        <li>
          来源：
          {Chunk.sourceUrl
            ? <a href={Chunk.sourceUrl} target="_blank" rel="noreferrer">{Chunk.sourceUrl}</a>
            : Chunk.source}
        </li>

        <li>
          文件：
          {Chunk.filePath}
        </li>

        <li>
          Chunk 标识：
          {Chunk.ids}
        </li>

        <li>
          Chunk 序号：
          {Chunk.chunkIndex}
        </li>

        <li>
          类型：
          {Chunk.type}
        </li>

        <li>
          文本：
          {Chunk.type === 'code'
            ? <pre className="code-result"><code>{Chunk.content}</code></pre>
            : Chunk.content}
        </li>

      </ul>

    </Card >

  )
}

export default ChunkCard
