import test from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import readAndChunkDocs from '../../services/rag/readAndChunkDocs'
import assert from 'node:assert/strict'


//文档能生成chunks,metadata正确
test('文档能生成chunks,metadata正确', () => {
  const chunks = readAndChunkDocs('data/docs/test')

  assert.ok(chunks.length > 0)
  assert.equal(chunks[0]?.metadata.title, 'React Hooks')
  assert.equal(chunks[0]?.metadata.filePath, path.join('test', 'test.md'))
})

test('代码块作为独立 chunk 保存，正文 chunk 不包含代码', () => {
  const chunks = readAndChunkDocs('data/docs/test')
  const codeChunk = chunks.find(chunk => chunk.metadata.type === 'code')
  const textChunks = chunks.filter(chunk => chunk.metadata.type !== 'code')

  assert.ok(codeChunk)
  assert.equal(codeChunk.metadata.lang, 'js')
  assert.match(codeChunk.content, /const \[count, setCount\]/)
  assert.ok(textChunks.every(chunk => !chunk.content.includes('const [count, setCount]')))
})

test('同一文件的 chunkIndex 从零开始连续递增', () => {
  const chunks = readAndChunkDocs('data/docs/test')

  assert.equal(chunks[0]?.metadata.chunkIndex, 0)
  for (let index = 1; index < chunks.length; index += 1) {
    assert.equal(
      chunks[index]?.metadata.chunkIndex,
      (chunks[index - 1]?.metadata.chunkIndex ?? -1) + 1
    )
  }
})

test('超过最大长度的段落会切分并保留 100 个字符的重叠', t => {
  const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'websearch-chunk-test-'))
  const documentPath = path.join(temporaryDir, 'long.md')
  t.after(() => fs.rmSync(temporaryDir, { recursive: true, force: true }))
  fs.writeFileSync(documentPath, `# 长文本\n\n${'a'.repeat(1200)}`, 'utf8')

  const chunks = readAndChunkDocs(temporaryDir)
  const lengthChunks = chunks.filter(chunk => chunk.metadata.type === 'length')

  assert.equal(lengthChunks.length, 3)
  assert.ok(lengthChunks.every(chunk => chunk.content.length <= 500))
  assert.equal(lengthChunks[0]?.content.slice(-100), lengthChunks[1]?.content.slice(0, 100))
  assert.equal(lengthChunks[1]?.content.slice(-100), lengthChunks[2]?.content.slice(0, 100))
})
