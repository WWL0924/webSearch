//集成测试

//
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import OpenAI from 'openai'
import { client, getCollection } from '../../services/rag/chromaClient.js'
import ragSearch from '../../services/rag/ragSearch.js'

//检索

test('检索流程查询测试 collection 并返回准备好的文档', async t => {
  //生成随机唯一标识符
  const suffix = randomUUID().replace(/-/g, '')

  //临时collection名
  const textCollectionName = `rag-test-${suffix}`
  const codeCollectionName = `code-test-${suffix}`

  //保存测试开始之前的环境变量
  const previousTextCollection = process.env.CHROMA_RAG_COLLECTION
  const previousCodeCollection = process.env.CHROMA_CODE_COLLECTION

  //存在process.env中,设置环境变量测试时getcollection读取
  process.env.CHROMA_RAG_COLLECTION = textCollectionName
  process.env.CHROMA_CODE_COLLECTION = codeCollectionName



  const embedding = [1, 0, 0] //
  const textCollection = await getCollection(textCollectionName)
  const codeCollection = await getCollection(codeCollectionName)

  //写入chunk 
  await textCollection.add({
    ids: ['rag-test-react-use-state'],
    embeddings: [embedding],
    documents: ['已知文档内容：React useState 用于在函数组件中保存状态。'],
    metadatas: [{
      source: 'data\\docs\\react',
      filePath: 'react/reference/useState.md',
      title: 'React useState',
      section: 'useState',
      sourceUrl: 'https://react.dev/reference/react/useState',
      chunkIndex: 0,
      type: 'section',
      length: 40,
      parentSectionId: 'rag-test:react:useState'
    }]
  })
  await codeCollection.add({
    ids: ['rag-test-react-use-state-code'],
    embeddings: [embedding],
    documents: ['const [state, setState] = useState(0)'],
    metadatas: [{
      source: 'data\\docs\\react',
      filePath: 'react/reference/useState.md',
      title: 'React useState',
      section: 'useState',
      sourceUrl: 'https://react.dev/reference/react/useState',
      chunkIndex: 1,
      type: 'code',
      lang: 'js',
      length: 38,
      parentSectionId: 'rag-test:react:useState'
    }]
  })

  //mock embedding 
  //模拟 创建文本 Embedding 向量方法
  t.mock.method(OpenAI.Embeddings.prototype, 'create', async () => ({
    data: [{ embedding }]
  }) as never)

  // 调用：真实运行 ragSearch、retrieve 和 Chroma 查询；只替换外部 embedding API。
  const result = await ragSearch({
    keyword: 'React useState',
    sources: ['react']
  })
  //删除测试用的collection
  t.after(async () => {
    //原本没设置就删除测试值
    if (previousTextCollection === undefined) delete process.env.CHROMA_RAG_COLLECTION
    else process.env.CHROMA_RAG_COLLECTION = previousTextCollection
    if (previousCodeCollection === undefined) delete process.env.CHROMA_CODE_COLLECTION
    //原本有值就恢复旧值
    else process.env.CHROMA_CODE_COLLECTION = previousCodeCollection
    await Promise.all([
      client.deleteCollection({ name: textCollectionName }),
      client.deleteCollection({ name: codeCollectionName })
    ])
  })

  // 检查：返回结构和测试 collection 中预置的正文、代码一致。
  assert.equal(result.success, true)
  assert.ok(Array.isArray(result.data.textChunks))
  assert.ok(Array.isArray(result.data.codeChunks))
  assert.equal(result.data.textChunkCount, result.data.textChunks.length)
  assert.ok(result.data.textChunks.some(chunk => chunk.content.includes('已知文档内容')))
  assert.ok(result.data.codeChunks.some(chunk => chunk.content.includes('setState')))
})
