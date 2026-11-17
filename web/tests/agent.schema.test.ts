import assert from 'node:assert/strict'
import { test } from 'node:test'
import { agentStreamEventSchema } from '../src/schemas/agent.schema.js'

for (const type of ['error', 'tool_error']) {
  const validEvent = { type, content: '请求失败', code: 'REQUEST_FAILED', retryable: false }

  test(`${type} 事件字段齐全时通过，保留 retryable: false`, () => {
    assert.deepEqual(agentStreamEventSchema.parse(validEvent), validEvent)
  })

  for (const field of ['content', 'code', 'retryable'] as const) {
    test(`${type} 事件缺少 ${field} 时校验失败`, () => {
      const input: Record<string, unknown> = { ...validEvent }
      delete input[field]
      const result = agentStreamEventSchema.safeParse(input)

      assert.equal(result.success, false)
      assert.ok(result.error.issues.some(issue => issue.path[0] === field))
    })
  }

  test(`${type} 事件拒绝数组消息、空错误码和字符串重试标识`, () => {
    for (const override of [{ content: [] }, { code: '' }, { retryable: 'false' }]) {
      assert.equal(agentStreamEventSchema.safeParse({ ...validEvent, ...override }).success, false)
    }
  })
}

for (const type of ['tool_call', 'tool_result', 'answer', 'done']) {
  test(`${type} 事件不要求附带错误字段`, () => {
    assert.deepEqual(agentStreamEventSchema.parse({ type }), { type })
  })
}

test('未知事件类型被拒绝', () => {
  assert.equal(agentStreamEventSchema.safeParse({ type: 'unknown' }).success, false)
})

test('普通事件接受字符串或数组内容', () => {
  for (const content of ['回答正文', [{ title: 'React' }]]) {
    const event = { type: 'answer', content }
    assert.deepEqual(agentStreamEventSchema.parse(event), event)
  }
})
