import assert from 'node:assert/strict'
import { test } from 'node:test'
import rewriteQuery from '../../services/rag/rewriteQuery.js'

test('列举类问题追加列表概览提示词', () => {
  assert.equal(rewriteQuery('React 有哪些常用 Hook'), 'React 有哪些常用 Hook 列表 概览 介绍')
})

test('对比类问题追加比较差异提示词', () => {
  assert.equal(rewriteQuery('React 和 Vue 有什么区别'), 'React 和 Vue 有什么区别 比较 差异 对比')
})

test('教程类问题追加示例步骤提示词', () => {
  assert.equal(rewriteQuery('React 怎么用'), 'React 怎么用 示例 教程 步骤 用法')
})

test('原理类问题追加机制实现提示词', () => {
  assert.equal(rewriteQuery('React Hooks 的底层原理'), 'React Hooks 的底层原理 原理 机制 实现')
})

test('普通问题保持原文不变', () => {
  assert.equal(rewriteQuery('React 是什么'), 'React 是什么')
})

test('多个意图同时匹配时按规则顺序优先处理列举意图', () => {
  assert.equal(rewriteQuery('有哪些区别'), '有哪些区别 列表 概览 介绍')
})
