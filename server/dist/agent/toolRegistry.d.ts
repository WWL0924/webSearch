import { type AgentTool } from './types.js';
type RegisteredTool = AgentTool<any, any>;
export declare function registerTool(tool: RegisteredTool): void;
export declare function getToolDefinitions(): {
    name: string;
    description: string;
    parameters: any;
}[];
export declare function executeTool(name: string, input: unknown): Promise<any>;
export {};
//# sourceMappingURL=toolRegistry.d.ts.map