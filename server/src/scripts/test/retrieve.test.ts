import assert from 'node:assert/strict'
import { test } from 'node:test'
import { client } from '../../services/rag/chromaClient.js'
import retrieve, { retrieveCodeBySections } from '../../services/rag/retrieve.js'
import { AgentError } from '../../agent/errors.js'

function makeMetadata(overrides: Record<string, unknown> = {}) {
  return {
    source: 'react',
    filePath: 'react/reference/hooks.md',
    title: 'React Hooks',
    section: 'useState',
    sourceUrl: 'https://react.dev/reference/react/useState',
    chunkIndex: 0,
    type: 'section',
    parentSectionId: 'react:hooks:0',
    ...overrides
  }
}

function makeQueryResult(records: Array<{
  id: string
  content: string
  metadata?: Record<string, unknown>
  distance: number
}>) {
  return {
    ids: [records.map(record => record.id)],
    documents: [records.map(record => record.content)],
    metadatas: [records.map(record => record.metadata ?? makeMetadata())],
    distances: [records.map(record => record.distance)]
  }
}

test('检索按来源过滤、距离过滤和相关度排序，并限制每个文件最多三个 chunk', async t => {
  let queryOptions: Record<string, unknown> | undefined
  const records = [
    { id: 'a1', content: 'React first', metadata: makeMetadata({ chunkIndex: 0 }), distance: 0.50 },
    { id: 'a2', content: 'React second', metadata: makeMetadata({ chunkIndex: 1 }), distance: 0.51 },
    { id: 'a3', content: 'React third', metadata: makeMetadata({ chunkIndex: 2 }), distance: 0.52 },
    { id: 'a4', content: 'React fourth', metadata: makeMetadata({ chunkIndex: 3 }), distance: 0.53 },
    {
      id: 'b1', content: 'React other file',
      metadata: makeMetadata({ filePath: 'react/other.md', title: 'Hooks' }), distance: 0.70
    },
    { id: 'filtered', content: 'Too far', distance: 0.80 }
  ]
  const collection = {
    query: async (options: Record<string, unknown>) => {
      queryOptions = options
      return makeQueryResult(records)
    }
  }
  t.mock.method(client, 'getOrCreateCollection', async () => collection as never)
  t.mock.method(console, 'log', () => {})

  const result = await retrieve([0.1], 'React', ['react'])

  assert.deepEqual(queryOptions?.where, { source: { $in: ['react'] } })
  assert.deepEqual(result.resultList.map(item => item.ids), ['a1', 'a2', 'a3', 'b1'])
  assert.equal(result.resultList.filter(item => item.filePath === 'react/reference/hooks.md').length, 3)
  assert.equal(result.noContent, false)
})

test('未命中距离阈值时返回无内容结果', async t => {
  const collection = {
    query: async () => makeQueryResult([
      { id: 'far', content: '无关片段', distance: 1.2 }
    ])
  }
  t.mock.method(client, 'getOrCreateCollection', async () => collection as never)
  t.mock.method(console, 'log', () => {})

  assert.deepEqual(await retrieve([0.1], 'React'), { noContent: true, resultList: [] })
})

test('Chroma 查询异常映射为可重试的 AgentError', async t => {
  t.mock.method(client, 'getOrCreateCollection', async () => {
    throw new Error('private database detail')
  })
  t.mock.method(console, 'log', () => {})

  await assert.rejects(retrieve([0.1], 'React'), error => {
    assert.ok(error instanceof AgentError)
    assert.equal(error.code, 'CHROMA_ERROR')
    assert.equal(error.retryable, true)
    assert.equal(error.message.includes('private database detail'), false)
    return true
  })
})

test('代码检索按来源过滤不合格项，并返回代码块 metadata', async t => {
  let getOptions: Record<string, unknown> | undefined
  const collection = {
    get: async (options: Record<string, unknown>) => {
      getOptions = options
      return {
        ids: ['react-code', 'vite-code', 'invalid-code'],
        documents: ['const state = 1', 'const vite = 1', null],
        metadatas: [
          makeMetadata({ type: 'code', lang: 'js' }),
          makeMetadata({ source: 'vite', type: 'code', lang: 'ts' }),
          makeMetadata({ type: 'code' })
        ]
      }
    }
  }
  t.mock.method(client, 'getOrCreateCollection', async () => collection as never)

  const result = await retrieveCodeBySections({ parentSectionIds: ['react:hooks:0'], sources: ['react'] })

  assert.deepEqual(getOptions?.where, { parentSectionId: { $in: ['react:hooks:0'] } })
  assert.equal(result.length, 1)
  assert.equal(result[0]?.ids, 'react-code')
  assert.equal(result[0]?.lang, 'js')
})

test('没有 parentSectionId 时不查询代码集合', async t => {
  let called = false
  t.mock.method(client, 'getOrCreateCollection', async () => {
    called = true
    return {} as never
  })

  assert.deepEqual(await retrieveCodeBySections({ parentSectionIds: [] }), [])
  assert.equal(called, false)
})
