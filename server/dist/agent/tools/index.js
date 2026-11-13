//统一导出所有工具,给agent框架用
import readTool from '../tools/readdocsection.tool';
import ragTool from './ragsearch.tool';
import creatTool from './createmarkdown.tool';
export const tools = [
    readTool,
    ragTool,
    creatTool
];
//# sourceMappingURL=index.js.map