import { Card } from 'antd'
import ChunkCard from './ChunkCard'
import type { ragResultItemType, ragCodeResultItemType } from '../../types/search'

interface ResultListProps {
  textResults: ragResultItemType[]
  codeResults: ragCodeResultItemType[]
}

function ResultList({ textResults, codeResults }: ResultListProps) {
  return (
    <>
      <Card
        title="向量数据库检索结果"
        style={{ width: '100%', maxWidth: 1200 }}
      >
        {
          textResults.length === 0
            ? <span>当前知识库没有相关资料</span>
            : textResults.map((item, index) => (
              <ChunkCard
                Chunk={item}
                index={index}
                key={`${item.sourceUrl}-${index}`}
              />
            ))
        }
      </Card>
      {codeResults.length > 0 && (
        <Card title="相关代码示例" style={{ width: '100%', maxWidth: 1200, marginTop: 16 }}>
          {codeResults.map((item, index) => (
            <ChunkCard
              Chunk={item}
              index={index}
              key={`${item.sourceUrl}-${index}`}
              isCode
            />
          ))}
        </Card>
      )}
    </>
  )
}

export default ResultList
