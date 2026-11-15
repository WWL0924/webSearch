import { Button, Card, Space, Steps, Tag } from 'antd'
import type { eventsType } from '../../types/agent'

type AgentProcessProps = {
  current: 0 | 1 | 2 | 3 | 4,
  events: eventsType[],
  content: string,
  toolCall?: string[],
  onRetry: () => void,
  loading: boolean,
}



function AgentProgress(
  { current, events, content, toolCall = [], onRetry, loading, }: AgentProcessProps) {
  const lastEvent = events.at(-1)
  const hasError = lastEvent?.type === 'error'
  const isDone = lastEvent?.type === 'done'

  //fronttype对应的中文名称
  const eventLabels: Record<eventsType['type'], string> = {
    tool_call: '调用工具',
    tool_result: '工具结果',
    tool_error: '工具失败',
    answer: '回答',
    done: '完成',
    error: '错误',
  }

  // 按阶段展示全部历史记录，保留同一阶段的多次工具调用。
  function renderEvents(step: eventsType['step'], fallback: string) {
    const stepEvents = events.filter(event => event.step === step)
    if (stepEvents.length === 0) return fallback

    return stepEvents.map((event, index) => (
      <div key={`${step}-${index}`} style={{ marginBlock: 8 }}>
        <Tag color={event.type === 'error' || event.type === 'tool_error' ? 'error' : 'blue'}>
          {/* 取出type对应的中文名称显示 */}
          {eventLabels[event.type]}
        </Tag>
        {event.type === 'error' && event.code && (
          <Tag color="default">{event.code}</Tag>
        )}

        {/* 最后一个事件显示重试按钮 */}
        {event.type === 'error' && typeof event.retryable === 'boolean' && (
          event.retryable ?
            event === lastEvent && (
              <Button
                //根据loading显示按钮状态
                onClick={() => {
                  if (loading) return
                  onRetry()
                }}
                loading={loading}
              >
                重试上次请求
              </Button>
            )

            : <Tag>不可重试</Tag>

        )
        }
        {/* toolCall不为空时渲染 */}
        {event.toolCall.length > 0 && <span>{event.toolCall.join('、')}</span>}
        <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {event.content}
        </div>


        {/* 检查文件存在再渲染按钮 */}
        {
          event.type === 'tool_result' && event.toolCall.includes('createMarkdown') && event.report && (
            <Space wrap style={{ marginTop: 8 }}>
              <Button href={event.report.mdUrl} download>
                下载 Markdown
              </Button>
              {event.report.mapUrl && (
                <Button href={event.report.mapUrl} target="_blank" rel="noopener noreferrer">
                  查看思维导图
                </Button>
              )}
            </Space>
          )
        }
      </div >
    ))
  }

  return (
    <Card
      title="Agent 执行流程"
      extra={
        <Tag color={hasError ? 'error' : isDone ? 'success' : 'default'}>
          {hasError ? '执行失败' : isDone ? '已完成' : events.length > 0 ? '执行中' : '等待搜索'}
        </Tag>
      }
      style={{ width: '100%', marginBlock: 16, textAlign: 'left' }}
    >
      {/* 当前为静态展示，后续自行接入步骤数据和执行状态 */}
      {/* 步骤内容已接入 events，current 负责标记当前阶段。 */}
      <Steps
        orientation="vertical"
        size="small"
        current={hasError && lastEvent ? lastEvent.step : current}
        status={hasError ? 'error' : isDone ? 'finish' : events.length > 0 ? 'process' : 'wait'}
        items={[
          {
            title: '分析问题',
            content: renderEvents(0, '理解用户问题，规划需要调用的工具'),
          },
          {
            title: '调用工具',
            content: renderEvents(1, current === 1 ? `调用工具:${content}` : '等待调用工具'),
          },
          {
            title: '接收工具结果',
            content: renderEvents(2, current === 2 ? `${toolCall.join('、')}工具检索结果如下${content}` : '等待工具返回结果'),
          },
          {
            title: '生成回答',
            content: renderEvents(3, '根据检索结果生成最终回答如下'),
          },
          {
            title: '结束',
            content: renderEvents(4, '等待任务结束'),
          },

        ]}
      />
    </Card>
  )
}

export default AgentProgress
