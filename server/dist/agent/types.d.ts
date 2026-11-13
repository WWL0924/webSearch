import { z } from 'zod';
export type AgentTool<TSchema extends z.ZodType, TOutput> = {
    name: string;
    description: string;
    inputSchema: TSchema;
    execute: (//执行
    input: z.output<TSchema>) => Promise<TOutput> | TOutput;
};
//# sourceMappingURL=types.d.ts.map