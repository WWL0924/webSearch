import { Card } from 'antd'
import ReactMarkdown from 'react-markdown';

type SummaryPanelProps = {
  data: string
}

function SummaryPanel({ data }: SummaryPanelProps) {
  return (
    <Card
      title="ai总结结果"
      style={{ width: 1000 }}
    >
      <ReactMarkdown>{data}</ReactMarkdown>
    </Card>
  )
}

export default SummaryPanel
