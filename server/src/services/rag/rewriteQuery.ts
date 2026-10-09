// 查询改写：根据用户意图优化检索词，提升召回准确度

/**
 * 检测查询意图并改写查询，帮助向量检索找到正确类型的文档
 * @param keyword 原始用户查询
 * @returns 改写后的查询
 */
function rewriteQuery(keyword: string): string {
  // 列举类查询：用户想要总结性/列表类内容，而非单个API细节
  if (/有哪些|常用|所有|列举|列出/.test(keyword)) {
    return `${keyword} 列表 概览 介绍`
  }

  // 对比类查询：用户想知道多个技术的差异
  if (/区别|对比|不同|差异|比较/.test(keyword)) {
    return `${keyword} 比较 差异 对比`
  }

  // 教程类查询：用户需要实践步骤，而非概念解释
  if (/怎么用|如何使用|怎么做|教程|步骤/.test(keyword)) {
    return `${keyword} 示例 教程 步骤 用法`
  }

  // 原理类查询：用户需要深入理解，而非快速上手
  if (/原理|为什么|底层|实现方式/.test(keyword)) {
    return `${keyword} 原理 机制 实现`
  }

  // 默认不改写
  return keyword
}

export default rewriteQuery
