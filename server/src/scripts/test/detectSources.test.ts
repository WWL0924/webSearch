import assert from 'node:assert/strict'
import { test } from 'node:test'
import detectSources from '../../services/rag/detectSources'
import officialSources from '../../config/officialSources'

//

for (let item of officialSources) {
  let source = item.source
  test(`${item.key}返回来源路径`, async () => {
    for (let aliase of item.aliases) {
      const test1 = await detectSources(aliase)
      assert.deepEqual(test1, [source])
    }
  })
}


test('无匹配文本返回[]', async () => {
  const test1 = await detectSources('java')
  assert.deepEqual(test1, [])
})

//
test('大小写不影响匹配', async () => {
  const test1 = await detectSources('React')
  assert.deepEqual(test1, ['data\\docs\\react'])
})

test('同时命中react和vite', async () => {
  const test1 = await detectSources('react和vite')
  assert.deepEqual(test1, ['data\\docs\\react', 'data\\docs\\vite'])
})