import { Card } from 'antd'

//list[''.'']
type ResultListProps = {
  list: []
}

function ResultList({ list }: ResultListProps) {
  return (
    <Card title="网页" style={{ width: 300 }}>
      {list.map((item) => (

        <li>{item}</li>

      ))}
    </Card>
  )
}

export default ResultList
