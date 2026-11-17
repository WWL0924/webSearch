import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ToolMessage } from '@langchain/core/messages'
import { AgentError } from '../../agent/errors.js'
import { createToolErrorMessage, toToolErrorEvent } from '../../agent/toolErrors.js'

test('已分类错误转换后保留错误码、调用标识和不可重试标记', () => {
  const message = createToolErrorMessage(
    new AgentError('INVALID_INPUT', '参数不合法', false, new Error('private diagnostic')),
    'readDocSection',
    'read-call'
  )

  assert.equal(message.status, 'error')
  assert.equal(message.tool_call_id, 'read-call')
  assert.deepEqual(toToolErrorEvent(message), {
    type: 'tool_error', toolCall: ['readDocSection'], content: '参数不合法',
    code: 'INVALID_INPUT', retryable: false
  })
  assert.equal(JSON.stringify(message).includes('private diagnostic'), false)
})

test('非 Error 的抛出值也转换为统一错误且不暴露原值', () => {
  for (const error of [null, undefined, 'private diagnostic', { secret: 'private diagnostic' }]) {
    const message = createToolErrorMessage(error, 'readDocSection', 'read-call')
    assert.deepEqual(toToolErrorEvent(message), {
      type: 'tool_error', toolCall: ['readDocSection'], content: 'readDocSection 工具执行失败',
      code: 'TOOL_EXECUTION_FAILED', retryable: false
    })
    assert.equal(JSON.stringify(message).includes('private diagnostic'), false)
  }
})

for (const content of [
  '工具执行失败',
  'not JSON',
  'null',
  '[]',
  '{}',
  JSON.stringify({ code: 'INVALID_INPUT', message: '参数不合法', retryable: 'false' })
]) {
  test(`无法解析为结构化错误时保留原消息：${content}`, () => {
    const message = new ToolMessage({ content, tool_call_id: 'read-call', name: 'readDocSection' })
    assert.deepEqual(toToolErrorEvent(message), {
      type: 'tool_error', toolCall: ['readDocSection'], content,
      code: 'TOOL_EXECUTION_FAILED', retryable: false
    })
  })
}

test('没有工具名称且内容为数组时返回兜底消息', () => {
  const message = new ToolMessage({
    content: [{ type: 'text', text: 'private diagnostic' }], tool_call_id: 'read-call'
  })

  assert.deepEqual(toToolErrorEvent(message), {
    type: 'tool_error', toolCall: [], content: '工具执行失败',
    code: 'TOOL_EXECUTION_FAILED', retryable: false
  })
})
