import { Card } from 'antd'

//list[''.'']
type ResultListProps = {
  list: []
}

function ResultList({ list }: ResultListProps) {
  return (
    <Card title="网页搜索结果" style={{ width: 500 }}>
      {list.map((item, index) => (
        // 这里想达到每一段换行
        <span key={index}>{item}</span>
      ))}
    </Card>
  )
}

export default ResultList
