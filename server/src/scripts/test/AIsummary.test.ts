import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Responses } from 'openai/resources/responses/responses'
import AIsummary from '../../services/rag/AIsummary.js'
import type { Response } from 'express'

function makeResponse() {
  const writes: string[] = []
  let endCount = 0
  return {
    writes,
    getEndCount: () => endCount,
    response: {
      write: (value: string) => writes.push(value),
      end: () => { endCount += 1 },
      destroyed: false
    } as unknown as Response
  }
}

test('没有正文结果时返回提示并结束响应，不请求模型', async t => {
  const { response, writes, getEndCount } = makeResponse()
  let requestCount = 0
  t.mock.method(Responses.prototype, 'create', async () => {
    requestCount += 1
    throw new Error('empty result must skip the model request')
  })
  t.mock.method(console, 'log', () => {})

  await AIsummary('React', [], [], response, new AbortController().signal)

  assert.deepEqual(writes, ['当前知识库没有相关资料'])
  assert.equal(getEndCount(), 1)
  assert.equal(requestCount, 0)
})

test('只转发模型输出文本增量，并在流结束后关闭响应', async t => {
  const { response, writes, getEndCount } = makeResponse()
  let requestInput = ''
  t.mock.method(Responses.prototype, 'create', async (params: { input: string }) => {
    requestInput = params.input
    return (async function* () {
      yield { type: 'response.created' }
      yield { type: 'response.output_text.delta', delta: 'React ' }
      yield { type: 'response.output_text.delta', delta: 'Hooks' }
      yield { type: 'response.completed' }
    })() as never
  })
  t.mock.method(console, 'log', () => {})
  const chunk = {
    content: 'Hooks 为函数组件提供状态能力',
    source: 'react',
    title: 'React Hooks',
    section: 'useState',
    sourceUrl: 'https://react.dev/reference/react/useState'
  }

  await AIsummary('React Hooks', [chunk], [], response, new AbortController().signal)

  assert.deepEqual(writes, ['React ', 'Hooks'])
  assert.equal(getEndCount(), 1)
  assert.match(requestInput, /React Hooks/)
  assert.match(requestInput, /Hooks 为函数组件提供状态能力/)
})

test('模型流中止后停止转发且不重复结束响应', async t => {
  const { response, writes, getEndCount } = makeResponse()
  const controller = new AbortController()
  t.mock.method(Responses.prototype, 'create', async () => {
    return (async function* () {
      yield { type: 'response.output_text.delta', delta: '首段' }
      controller.abort()
      yield { type: 'response.output_text.delta', delta: '不应转发' }
    })() as never
  })
  t.mock.method(console, 'log', () => {})
  const chunk = {
    content: '上下文', source: 'react', title: 'React', section: 'Hooks',
    sourceUrl: 'https://react.dev'
  }

  await AIsummary('React', [chunk], [], response, controller.signal)

  assert.deepEqual(writes, ['首段'])
  assert.equal(getEndCount(), 0)
})
