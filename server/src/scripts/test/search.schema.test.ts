import { agentRequestSchema, ragSearchInputSchema } from "../../schemas/search.schema"
import assert from 'node:assert/strict'//断言工具
import { test } from 'node:test'

//测试输入
function testInput1(obj: unknown) {

  //断言 schema 的解析结果符合预期
  const input1 = ragSearchInputSchema.safeParse(obj)
  //  input11结构
  //   {
  //     success: boolean,
  //       data:
  //   }


  //断言工具
  assert.equal(input1.success, true)//值不是true抛出错误

  //检查默认值
  assert.deepEqual(input1.data.sources, [])

}


test('省略 sources 时默认得到空数组', () => {
  testInput1({ keyword: 'vite是什么' })
})

test('sources 不是数组时校验失败', () => {
  const result = ragSearchInputSchema.safeParse({
    keyword: 'vite是什么',
    sources: 'vite'
  })

  assert.equal(result.success, false)
})

test('sources 数组元素类型错误时校验失败', () => {
  const result = ragSearchInputSchema.safeParse({
    keyword: 'vite是什么',
    sources: [123]
  })

  assert.equal(result.success, false)
})

test('keyword 类型错误时校验失败', () => {
  const result = ragSearchInputSchema.safeParse({ keyword: 123 })

  assert.equal(result.success, false)
})

test('缺少 keyword 时校验失败', () => {
  const result = ragSearchInputSchema.safeParse({})

  assert.equal(result.success, false)
})

test('合法来源校验成功并保留来源数组', () => {
  const result = ragSearchInputSchema.safeParse({
    keyword: 'vite',
    sources: ['react', 'vite']
  })

  assert.equal(result.success, true)
  assert.deepEqual(result.data.sources, ['react', 'vite'])
})

test('不在允许范围内的来源校验失败', () => {
  const result = ragSearchInputSchema.safeParse({
    keyword: 'vite',
    sources: ['unknown']
  })

  assert.equal(result.success, false)
})

test('agent 请求省略可选字段时得到正确默认值', () => {
  const result = agentRequestSchema.safeParse({ keyword: 'vite' })

  assert.equal(result.success, true)
  assert.deepEqual(result.data, {
    keyword: 'vite',
    sources: [],
    ismd: false,
    isMap: 'auto'
  })
})

//每个isMap的值都要测试一次
for (const isMap of ['true', 'false', 'auto']) {
  test(`agent 请求保留显式传入的 ismd 和 isMap: ${isMap}`, () => {
    const result = agentRequestSchema.safeParse({
      keyword: 'vite',
      ismd: true,
      isMap
    })

    assert.equal(result.success, true)
    assert.equal(result.data.ismd, true)
    assert.equal(result.data.isMap, isMap)
  })
}

test('agent 请求的 ismd 为字符串时校验失败', () => {
  const result = agentRequestSchema.safeParse({ keyword: 'vite', ismd: 'true' })

  assert.equal(result.success, false)
})

test('agent 请求的 isMap 为布尔值时校验失败', () => {
  const result = agentRequestSchema.safeParse({ keyword: 'vite', isMap: true })

  assert.equal(result.success, false)
})

test('agent 请求的 isMap 不在允许范围内时校验失败', () => {
  const result = agentRequestSchema.safeParse({ keyword: 'vite', isMap: 'other' })

  assert.equal(result.success, false)
})


