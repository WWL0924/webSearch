import assert from 'node:assert/strict'
import { test } from 'node:test'
import OpenAI from 'openai'
import type { IndexedChunk } from '../../types/rag.js'
import { embeddingChunks, embeddingKeywords } from '../../services/rag/embedding.js'

function makeChunk(index: number): IndexedChunk {
  return {
    id: `doc.md#${index}`,
    chunksIndex: index,
    content: `正文 ${index}`,
    metadata: {
      source: 'react',
      filePath: 'react/hooks.md',
      title: 'React Hooks',
      section: 'useState',
      sourceUrl: 'https://react.dev/reference/react/useState',
      chunkIndex: index,
      type: 'section',
      length: 4,
      parentSectionId: 'react:hooks:0'
    }
  }
}

test('embeddingChunks 每批最多请求十条并将向量对应回原 chunk', async t => {
  const inputBatches: string[][] = []
  t.mock.method(OpenAI.Embeddings.prototype, 'create', async (params: { input: string[] | string }) => {
    const inputs = Array.isArray(params.input) ? params.input : [params.input]
    inputBatches.push(inputs)
    return {
      data: inputs.map((_, index) => ({ embedding: [inputBatches.length, index] }))
    } as never
  })

  const chunks = Array.from({ length: 11 }, (_, index) => makeChunk(index))
  const result = await embeddingChunks(chunks)

  assert.deepEqual(inputBatches.map(batch => batch.length), [10, 1])
  assert.equal(result.length, 11)
  assert.deepEqual(result[0]?.embedding, [1, 0])
  assert.deepEqual(result[10]?.embedding, [2, 0])
  assert.equal(result[10]?.content, '正文 10')
  assert.match(inputBatches[0]?.[0] ?? '', /标题：React Hooks[\s\S]*正文：正文 0/)
})

test('embeddingChunks 在响应缺少向量时报告对应批次中的索引', async t => {
  t.mock.method(OpenAI.Embeddings.prototype, 'create', async () => ({ data: [] }) as never)

  await assert.rejects(embeddingChunks([makeChunk(0)]), /第 0 条文本没有对应的向量结果/)
})

test('embeddingKeywords 传递关键词和取消信号并返回向量', async t => {
  const controller = new AbortController()
  let requestInput: unknown
  let requestOptions: unknown
  t.mock.method(OpenAI.Embeddings.prototype, 'create', async (params: { input: unknown }, options: unknown) => {
    requestInput = params.input
    requestOptions = options
    return { data: [{ embedding: [0.1, 0.2] }] } as never
  })

  assert.deepEqual(await embeddingKeywords('React Hooks', controller.signal), [0.1, 0.2])
  assert.equal(requestInput, 'React Hooks')
  assert.deepEqual(requestOptions, { signal: controller.signal })
})

test('embeddingKeywords 响应没有向量时报告失败', async t => {
  t.mock.method(OpenAI.Embeddings.prototype, 'create', async () => ({ data: [] }) as never)

  await assert.rejects(embeddingKeywords('React Hooks'), /用户提问检索失败/)
})
