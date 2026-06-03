import { Card } from 'antd'

type SummaryPanelProps = {
  data: string
}

function SummaryPanel({ data }: SummaryPanelProps) {
  return (
    <Card
      title="总结结果"
      style={{ width: 500 }}
    >
      {data}
    </Card>
  )
}

export default SummaryPanel
