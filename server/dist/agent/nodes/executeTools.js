import { ToolNode } from '@langchain/langgraph/prebuilt';
import { langgraphTools } from '../tools/index.langgraph';
//创建ToolNode实例
export const executeTools = new ToolNode(langgraphTools);
//# sourceMappingURL=executeTools.js.map