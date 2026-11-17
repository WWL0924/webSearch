import assert from 'node:assert/strict'
import { test } from 'node:test'
import extractKeywords from '../../services/rag/extractKeywords.js'

test('英文关键词转换为小写', () => {
  assert.deepEqual(extractKeywords('React VITE useState'), ['react', 'vite', 'usestate'])
})

test('重复关键词去重并保留首次出现的顺序', () => {
  assert.deepEqual(extractKeywords('Vite React vite REACT'), ['vite', 'react'])
})

test('过滤独立出现的中文停用词', () => {
  assert.deepEqual(extractKeywords('怎么 如何 为什么 什么 哪些 一下 是什么 介绍一下 React'), ['react'])
})

test('保留中文关键词并去重', () => {
  assert.deepEqual(extractKeywords('组件 状态 组件'), ['组件', '状态'])
})

test('保留技术关键词中的数字、下划线和连字符', () => {
  assert.deepEqual(extractKeywords('Vue3 VITE_API create-vite'), ['vue3', 'vite_api', 'create-vite'])
})

test('过滤单字符关键词', () => {
  assert.deepEqual(extractKeywords('a B 的 了 吗 React'), ['react'])
})

test('空字符串、空白和无关键词文本返回空数组', () => {
  for (const input of ['', '   \n\t', '123 !?，。']) {
    assert.deepEqual(extractKeywords(input), [])
  }
})

test('中英文混合输入分别提取并合并关键词', () => {
  assert.deepEqual(extractKeywords('React 组件 Vite 状态'), ['react', 'vite', '组件', '状态'])
})
