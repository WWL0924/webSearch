import { Card } from 'antd'
import ChunkCard from './ChunkCard'
import type { ResultItem } from '../../types/search'

interface ResultListProps {
  list: ResultItem[]
}

function ResultList({ list }: ResultListProps) {
  return (
    <Card
      title="向量数据库检索结果"
      style={{ width: 500 }}
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
  )
}

export default ResultList
