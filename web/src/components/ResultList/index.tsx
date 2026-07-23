import { Card } from 'antd'

//list[''.'']
type ResultListProps = {
  list: string[]
}

function ResultList({ list }: ResultListProps) {
  return (
    <Card title="向量数据库检索结果" style={{ width: 500 }}>
      {list.map((item, index) => (
        <div key={index} style={{ marginBottom: 12 }}>
          <div>片段 {index + 1}</div>
          <p>{item}</p>
        </div>
      ))}
    </Card>
  )
}

export default ResultList
