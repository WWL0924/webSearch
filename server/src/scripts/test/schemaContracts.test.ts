//关于shchema的单元测试都在这里么



import assert from 'node:assert/strict'
import { test } from 'node:test'
import { aiSchema } from '../../schemas/ai.schema.js'
import { chunkSchema } from '../../schemas/chunk.schema.js'
import { readDocSectionInputSchema, readDocSectionOutputSchema } from '../../schemas/read.schema.js'
import { Report, createMarkdownInputSchema, createMarkdownOutputSchema } from '../../schemas/report.shcema.js'
import { ragSearchOutputSchema } from '../../schemas/search.schema.js'

const chunk = {
  content: '正文',
  source: 'react',
  title: 'React',
  section: '用法',
  sourceUrl: 'https://react.dev/reference'
}


test('共享 chunk 允许省略检索侧可选字段', () => {
  assert.deepEqual(chunkSchema.parse(chunk), chunk)
})


test('AI 请求接受合法 chunk，允许省略 codeResults', () => {
  const result = aiSchema.safeParse({ keyword: 'React', list: [chunk] })

  assert.equal(result.success, true)
  assert.deepEqual(result.data.list, [chunk])
  assert.equal(result.data.codeResults, undefined)
})


//关键词长度 1-200
for (const length of [1, 200]) {
  test(`AI 关键词长度为 ${length} 时通过校验`, () => {
    assert.equal(aiSchema.safeParse({ keyword: 'a'.repeat(length), list: [] }).success, true)
  })
}

//关键词长度0 201 拒绝
for (const length of [0, 201]) {
  test(`AI 关键词长度为 ${length} 时校验失败`, () => {
    assert.equal(aiSchema.safeParse({ keyword: 'a'.repeat(length), list: [] }).success, false)
  })
}


test('AI 请求拒绝缺少展示字段的 chunk', () => {
  const { title, ...incompleteChunk } = chunk
  assert.equal(aiSchema.safeParse({ keyword: 'React', list: [incompleteChunk] }).success, false)
})

test('AI 请求接受代码结果数组并拒绝错误结构', () => {
  assert.equal(aiSchema.safeParse({ keyword: 'React', list: [], codeResults: [chunk] }).success, true)
  assert.equal(aiSchema.safeParse({ keyword: 'React', list: [], codeResults: ['code'] }).success, false)
})


test('读取文档请求允许省略章节，也保留指定章节', () => {
  assert.deepEqual(readDocSectionInputSchema.parse({ filePath: 'react/test.md' }), {
    filePath: 'react/test.md'
  })
  const input = { filePath: 'react/test.md', section: '用法' }
  assert.deepEqual(readDocSectionInputSchema.parse(input), input)
})

test('读取文档请求拒绝缺少路径和错误章节类型', () => {
  assert.equal(readDocSectionInputSchema.safeParse({}).success, false)
  assert.equal(readDocSectionInputSchema.safeParse({ filePath: 'react/test.md', section: 123 }).success, false)
})

test('读取文档输出允许 section 为 null，但不允许省略', () => {
  const output = { content: '正文', filePath: 'react/test.md' }
  assert.equal(readDocSectionOutputSchema.safeParse({ ...output, section: null }).success, true)
  assert.equal(readDocSectionOutputSchema.safeParse(output).success, false)
})

test('报告请求默认使用 auto，并允许空检索结果', () => {
  const input = { keyword: 'React', textChunks: [], codeChunks: [] }
  assert.deepEqual(createMarkdownInputSchema.parse(input), { ...input, isMap: 'auto' })
})

test('报告请求拒绝空关键词、非法模式和缺失结果数组', () => {
  const input = { keyword: 'React', textChunks: [], codeChunks: [] }
  assert.equal(createMarkdownInputSchema.safeParse({ ...input, keyword: '' }).success, false)
  assert.equal(createMarkdownInputSchema.safeParse({ ...input, isMap: 'other' }).success, false)
  assert.equal(createMarkdownInputSchema.safeParse({ keyword: 'React' }).success, false)
})

test('报告输出允许没有脑图文件，但必须显式返回 null', () => {
  assert.equal(createMarkdownOutputSchema.safeParse({ mdFileName: 'report.md', mapFileName: null }).success, true)
  assert.equal(createMarkdownOutputSchema.safeParse({ mdFileName: 'report.md', mapFileName: 'map.html' }).success, true)
  assert.equal(createMarkdownOutputSchema.safeParse({ mdFileName: 'report.md' }).success, false)
})

test('搜索输出保留正文评分、代码语言和结果数量', () => {
  const output = {
    success: true,
    data: {
      textChunks: [{ ...chunk, filePath: 'react/test.md', score: 0.2 }],
      codeChunks: [{ ...chunk, lang: 'tsx' }],
      textChunkCount: 1
    }
  }
  const result = ragSearchOutputSchema.parse(output)

  assert.deepEqual(result.data.textChunks, output.data.textChunks)
  assert.equal(result.data.codeChunks[0]?.lang, 'tsx')
  assert.equal(result.data.textChunkCount, 1)
})

test('搜索输出接受空结果和省略语言的代码块', () => {
  assert.equal(ragSearchOutputSchema.safeParse({
    success: true,
    data: { textChunks: [], codeChunks: [], textChunkCount: 0 }
  }).success, true)
  assert.equal(ragSearchOutputSchema.safeParse({
    success: true,
    data: { textChunks: [], codeChunks: [chunk], textChunkCount: 0 }
  }).success, true)
})

test('搜索输出拒绝不完整的正文块和字符串评分', () => {
  for (const textChunk of [chunk, { ...chunk, filePath: 'react/test.md', score: '0.2' }]) {
    assert.equal(ragSearchOutputSchema.safeParse({
      success: true,
      data: { textChunks: [textChunk], codeChunks: [], textChunkCount: 1 }
    }).success, false)
  }
})

test('报告请求接受完整检索结果并保留显式脑图模式', () => {
  const textChunk = { ...chunk, filePath: 'react/test.md', score: 0.2 }
  const codeChunk = { ...chunk, lang: 'tsx' }
  const result = createMarkdownInputSchema.parse({
    keyword: 'React', isMap: 'false', textChunks: [textChunk], codeChunks: [codeChunk]
  })

  assert.equal(result.isMap, 'false')
  assert.deepEqual(result.textChunks, [textChunk])
  assert.equal(result.codeChunks[0]?.lang, 'tsx')
})

test('报告请求拒绝缺少评分的正文块和错误代码语言类型', () => {
  const input = { keyword: 'React', textChunks: [], codeChunks: [] }
  assert.equal(createMarkdownInputSchema.safeParse({ ...input, textChunks: [chunk] }).success, false)
  assert.equal(createMarkdownInputSchema.safeParse({ ...input, codeChunks: [{ ...chunk, lang: 123 }] }).success, false)
})

test('结构化报告接受完整字段，代码和引用正文允许为空字符串', () => {
  const report = {
    title: 'React', task: '解释组件', conclusion: '结论', analysis: '分析',
    sourceMarkdown: '', code: ''
  }
  assert.deepEqual(Report.parse(report), report)
})

test('结构化报告拒绝缺少分析字段和错误的代码类型', () => {
  const report = { title: 'React', task: '解释组件', conclusion: '结论', sourceMarkdown: '', code: '' }
  assert.equal(Report.safeParse(report).success, false)
  assert.equal(Report.safeParse({ ...report, analysis: '分析', code: [] }).success, false)
})
