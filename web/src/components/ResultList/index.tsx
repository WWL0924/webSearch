import { Card } from 'antd'
import ChunkCard from './ChunkCard'
import type { ResultItem } from '../../types/search'

interface ResultListProps {
  list: ResultItem[]
  codeResults: ResultItem[]
}

function ResultList({ list, codeResults }: ResultListProps) {
  return (
    <>
      <Card
        title="向量数据库检索结果"
        style={{ width: '100%', maxWidth: 1200 }}
      >
        {
          list.length === 0
            ? <span>当前知识库没有相关资料</span>
            : list.map((item, index) => (
              <ChunkCard
                Chunk={item}
                index={index}
                key={item.ids}
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
              key={item.ids}
            />
          ))}
        </Card>
      )}
    </>
  )
}

export default ResultList
