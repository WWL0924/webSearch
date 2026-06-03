import { Card } from 'antd'

type SearchItem = {
  title: string
  url?: string
}

type ResultListProps = {
  list: SearchItem[]
}

function ResultList({ list }: ResultListProps) {
  return (
    <Card title="网页" style={{ width: 300 }}>
      {list.map((item) => (
        <div key={item.url ?? item.title}>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </div>
      ))}
    </Card>
  )
}

export default ResultList
