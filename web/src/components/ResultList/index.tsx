import { Card } from 'antd'

type ResultListProps = {
  url: string
}

function ResultList({ url }: ResultListProps) {
  return (
    <Card
      title="网页列表"
      style={{ width: 300 }}
    >
      {url}
    </Card>
  )
}

export default ResultList
