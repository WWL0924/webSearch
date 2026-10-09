import assert from 'node:assert/strict';
import dealDocs from '../rag/readAndChunkDocs.js';
const chunks = dealDocs('data\\docs\\react');
assert.ok(chunks.length > 0, '应该至少生成一个 chunk');
const firstMetadata = chunks[0]?.metadata;
assert.equal(typeof firstMetadata?.title, 'string');
assert.equal(typeof firstMetadata?.section, 'string');
assert.equal(typeof firstMetadata?.sourceUrl, 'string');
assert.equal(typeof firstMetadata?.filePath, 'string');
assert.equal(typeof firstMetadata?.chunkIndex, 'number');
const indexesByFile = new Map();
for (const chunk of chunks) {
    const indexes = indexesByFile.get(chunk.metadata.filePath) ?? [];
    indexes.push(chunk.metadata.chunkIndex);
    indexesByFile.set(chunk.metadata.filePath, indexes);
}
for (const [filePath, indexes] of indexesByFile) {
    const firstIndex = indexes[0];
    assert.equal(firstIndex, 0, `${filePath} 的第一个 chunk 应该从 0 开始`);
    for (let index = 1; index < indexes.length; index += 1) {
        const currentIndex = indexes[index];
        const previousIndex = indexes[index - 1];
        assert.equal(currentIndex, previousIndex + 1, `${filePath} 的 chunkIndex 应该连续递增`);
    }
}
console.log('metadata test passed');
//# sourceMappingURL=testMetadata.js.map