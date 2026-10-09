const MAP_KEYWORDS = [
    '思维导图', 'mind map', 'mindmap', '流程', '架构', '原理', '步骤',
    '过程', '关系', '层级', '分类', '对比', '比较', '梳理', '知识体系',
    '调用链', '生命周期', 'workflow', 'architecture', 'principle',
    'relationship', 'hierarchy', 'classification', 'compare', 'comparison',
    'overview', 'structure', 'lifecycle', 'call chain', 'steps', 'process',
];
// 当前阶段使用关键词规则；后续可在 auto 分支接入 Agent Loop/LLM。
async function judjeIsmap(keyword, isMap = 'auto') {
    if (isMap === 'true')
        return true;
    if (isMap === 'false')
        return false;
    const normalizedKeyword = keyword.trim().toLocaleLowerCase();
    if (!normalizedKeyword)
        return false;
    return MAP_KEYWORDS.some(item => normalizedKeyword.includes(item));
}
export default judjeIsmap;
//# sourceMappingURL=judjeIsmap.js.map