import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AIMessage, ToolMessage } from '@langchain/core/messages'
import { tool, type ToolRuntime } from '@langchain/core/tools'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { z } from 'zod'
import { AgentError } from '../../agent/errors'
import { createToolErrorMessage, toToolErrorEvent } from '../../agent/toolErrors'
import { readTool } from '../../agent/tools/readdocsection.langgraph.tool'

test('ToolNode 保留原错误码,成功与失败的工具结果可以同时返回', async () => {
  const error = new AgentError('CHROMA_ERROR', '文本向量数据库查询失败', true, new Error('private diagnostic'))
  const failedTool = tool(
    (_input, runtime: ToolRuntime) => createToolErrorMessage(error, 'failed', runtime.toolCallId),
    { name: 'failed', description: 'failed tool', schema: z.object({}) }
  )
  const successfulTool = tool(
    () => ({ value: 'success' }),
    { name: 'successful', description: 'successful tool', schema: z.object({}) }
  )
  const node = new ToolNode([failedTool, successfulTool])
  const result = await node.invoke({
    messages: [new AIMessage({
      content: '',
      tool_calls: [
        { name: 'failed', args: {}, id: 'failed-call' },
        { name: 'successful', args: {}, id: 'successful-call' },
      ],
    })],
  })

  const failed: ToolMessage = result.messages[0]
  assert.equal(failed.status, 'error')
  assert.equal(failed.tool_call_id, 'failed-call')
  const event = JSON.parse(JSON.stringify(toToolErrorEvent(failed)))
  assert.deepEqual(event, {
    type: 'tool_error',
    toolCall: ['failed'],
    content: '文本向量数据库查询失败',
    code: 'CHROMA_ERROR',
    retryable: true,
  })
  assert.equal(JSON.stringify(failed).includes('private diagnostic'), false)
  assert.equal(result.messages[1].status, 'success')
  assert.deepEqual(JSON.parse(result.messages[1].content), { value: 'success' })
})

test('普通异常使用统一分类,原始诊断信息留在后端', () => {
  const message = createToolErrorMessage(new Error('private path'), 'createMarkdown', 'report-call')
  const event = toToolErrorEvent(message)
  assert.equal(event.code, 'TOOL_EXECUTION_FAILED')
  assert.equal(event.content, 'createMarkdown 工具执行失败')
  assert.equal(event.retryable, false)
  assert.equal(JSON.stringify(message).includes('private path'), false)
})

test('真实读取工具失败时记录日志并返回错误 ToolMessage', async t => {
  const logger = t.mock.method(console, 'error', () => {})
  const result = await new ToolNode([readTool]).invoke({
    messages: [new AIMessage({
      content: '',
      tool_calls: [{ name: 'readDocSection', args: { filePath: '../outside.md' }, id: 'read-call' }],
    })],
  })

  assert.equal(logger.mock.callCount(), 1)
  assert.ok(logger.mock.calls[0]?.arguments[1] instanceof Error)
  assert.equal(result.messages[0].tool_call_id, 'read-call')
  assert.equal(result.messages[0].status, 'error')
  assert.equal(toToolErrorEvent(result.messages[0]).code, 'INVALID_INPUT')
})

test('工具参数校验失败和未知工具仍由框架处理,文本错误可以转换为前端事件', async () => {
  const result = await new ToolNode([readTool]).invoke({
    messages: [new AIMessage({
      content: '',
      tool_calls: [
        { name: 'readDocSection', args: { filePath: 123 }, id: 'invalid-call' },
        { name: 'missingTool', args: {}, id: 'missing-call' },
      ],
    })],
  })

  for (const message of result.messages) {
    assert.equal(message.status, 'error')
    const event = toToolErrorEvent(message)
    assert.equal(event.type, 'tool_error')
    assert.equal(event.code, 'TOOL_EXECUTION_FAILED')
    assert.equal(typeof event.content, 'string')
  }
})
