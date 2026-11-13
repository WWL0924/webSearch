import { Card } from "antd"
import type { ragResultItemType, ragCodeResultItemType } from '../../../types/search'

interface ChunkCardProps {
  Chunk: ragResultItemType | ragCodeResultItemType,
  index: number
  isCode?: boolean
}

function ChunkCard({ Chunk, index, isCode = false }: ChunkCardProps) {

  return (

    <Card
      size="small"
      style={{
        marginBottom: 16
      }}

      title={isCode
        ? `代码示例 ${index + 1}${'lang' in Chunk && Chunk.lang ? ` · ${Chunk.lang}` : ''}`
        : `第${index + 1}条`}
    >

      <ul>

        <li>
          文档标题：
          {Chunk.title}
        </li>

        {'section' in Chunk && (
          <li>
            章节：
            {Chunk.section}
          </li>
        )}

        <li>
          来源：
          {Chunk.sourceUrl
            ? <a href={Chunk.sourceUrl} target="_blank" rel="noreferrer">{Chunk.sourceUrl}</a>
            : Chunk.source}
        </li>

        <li>
          类型：
          {isCode ? 'code' : 'text'}
        </li>

        <li>
          文本：
          {isCode
            ? <pre className="code-result"><code>{Chunk.content}</code></pre>
            : Chunk.content}
        </li>

      </ul>

    </Card >

  )
}

export default ChunkCard
