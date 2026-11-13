import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ChatOpenAI } from '@langchain/openai'
import { Responses } from 'openai/resources/responses/responses'
import { AgentError } from '../../agent/errors'
import { createToolErrorMessage, toToolErrorEvent } from '../../agent/toolErrors'
import readDocSection from '../../services/rag/readDocSection'

test('文档错误能区分路径无效、文件不存在和章节不存在，并保留到前端事件', () => {
  const cases = [
    { input: { filePath: '../outside.md' }, code: 'INVALID_INPUT' },
    { input: { filePath: 'test/__missing_agent_error_document__.md' }, code: 'DOCUMENT_NOT_FOUND' },
    { input: { filePath: 'test/test.md', section: '__missing_agent_error_section__' }, code: 'DOCUMENT_SECTION_NOT_FOUND' },
  ]

  for (const { input, code } of cases) {
    assert.throws(() => readDocSection(input), (error: unknown) => {
      assert.ok(error instanceof AgentError)
      assert.equal(error.code, code)
      assert.equal(error.retryable, false)
      const event = toToolErrorEvent(createToolErrorMessage(error, 'readDocSection', 'read-call'))
      assert.equal(event.code, code)
      assert.equal(event.retryable, false)
      return true
    })
  }

  assert.match(readDocSection({ filePath: 'test/test.md', section: 'useState' }).content, /useState/)
})

test('模型错误经过完整 Agent 图后仍保留分类、重试标记和原始原因', async t => {
  process.env.DASHSCOPE_API_KEY ||= 'test-key-no-network'
  let providerError: unknown
  t.mock.method(ChatOpenAI.prototype, 'bindTools', () => ({
    invoke: async () => { throw providerError },
  }))
  t.mock.method(console, 'error', () => {})
  t.mock.method(console, 'log', () => {})
  const { runAgent } = await import('../../agent/graph')
  const cases = [
    { error: { status: 401 }, code: 'LLM_AUTH_FAILED', retryable: false },
    { error: { status: 403 }, code: 'LLM_AUTH_FAILED', retryable: false },
    { error: { status: 400 }, code: 'LLM_INVALID_REQUEST', retryable: false },
    { error: { status: 404 }, code: 'LLM_INVALID_REQUEST', retryable: false },
    { error: { status: 422 }, code: 'LLM_INVALID_REQUEST', retryable: false },
    { error: { status: 429 }, code: 'LLM_RATE_LIMIT', retryable: true },
    { error: { name: 'APIConnectionTimeoutError' }, code: 'LLM_TIMEOUT', retryable: true },
    { error: { code: 'ECONNRESET' }, code: 'NETWORK_ERROR', retryable: true },
    { error: { status: 503 }, code: 'LLM_REQUEST_FAILED', retryable: true },
    { error: { name: 'AbortError' }, code: 'TASK_CANCELLED', retryable: false },
  ]

  for (const { error, code, retryable } of cases) {
    providerError = error
    await assert.rejects(async () => {
      for await (const _update of runAgent('test', [], new AbortController().signal)) {
      }
    }, (caught: unknown) => {
      assert.ok(caught instanceof AgentError)
      assert.equal(caught.code, code)
      assert.equal(caught.retryable, retryable)
      assert.equal(caught.cause, error)
      return true
    })
  }
})

test('报告区分无效 JSON、字段错误和超出大小上限，合法报告仍可解析', async t => {
  process.env.DASHSCOPE_API_KEY ||= 'test-key-no-network'
  let outputText = ''
  t.mock.method(Responses.prototype, 'create', async () => ({ output_text: outputText }))
  t.mock.method(console, 'log', () => {})
  const { default: reportData } = await import('../../services/rag/reportData')
  const { default: createMarkdown } = await import('../../services/rag/createMarkdown')

  for (const output of ['not JSON', 'null', '[]', '"text"', '{}', '{"title":123}']) {
    outputText = output
    await assert.rejects(reportData('test', [], []), (error: unknown) => {
      assert.ok(error instanceof AgentError)
      assert.equal(error.code, 'LLM_INVALID_RESPONSE')
      assert.equal(error.retryable, true)
      assert.ok(error.cause instanceof Error)
      const event = toToolErrorEvent(createToolErrorMessage(error, 'createMarkdown', 'report-call'))
      assert.equal(event.code, 'LLM_INVALID_RESPONSE')
      return true
    })
  }

  const validReport = { title: 'test', task: 'test', conclusion: 'test', analysis: 'test' }
  outputText = JSON.stringify(validReport)
  assert.deepEqual(await reportData('test', [], []), { ...validReport, code: '', sourceMarkdown: '' })

  outputText = JSON.stringify({ ...validReport, analysis: '中'.repeat(750_000) })
  await assert.rejects(createMarkdown({ keyword: 'test', isMap: 'false', textChunks: [], codeChunks: [] }), (error: unknown) => {
    assert.ok(error instanceof AgentError)
    assert.equal(error.code, 'REPORT_TOO_LARGE')
    assert.equal(error.retryable, false)
    return true
  })
})
