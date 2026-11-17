import assert from 'node:assert/strict'
import { test } from 'node:test'
import judjeIsmap from '../../services/rag/judjeIsmap.js'

test('显式开启脑图时，即使关键词为空也返回 true', async () => {
  assert.equal(await judjeIsmap('', 'true'), true)
})

test('显式关闭脑图时，即使命中关键词也返回 false', async () => {
  assert.equal(await judjeIsmap('React 架构', 'false'), false)
})

test('省略模式时默认按 auto 判断', async () => {
  assert.equal(await judjeIsmap('React 架构'), true)
  assert.equal(await judjeIsmap('安装 React'), false)
})

for (const keyword of ['组件生命周期', '绘制流程', 'MIND MAP', '  Architecture  ']) {
  test(`auto 模式命中关键词：${keyword}`, async () => {
    assert.equal(await judjeIsmap(keyword, 'auto'), true)
  })
}

test('auto 模式下空白或无匹配关键词返回 false', async () => {
  for (const keyword of ['', '  \n\t', '安装 React']) {
    assert.equal(await judjeIsmap(keyword, 'auto'), false)
  }
})
