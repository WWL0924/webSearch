//加载配置文件
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import z from 'zod';
const path1 = path.dirname(fileURLToPath(import.meta.url)); //当前文件绝对路目录上一层
dotenv.config({
    path: path.resolve(path1, '../../.env') //env的路径
});
//把env中的内容放到process.env环境变量里面了
//检查
const envSchema = z.object({
    DASHSCOPE_API_KEY: z.string().min(1, '缺少 DASHSCOPE_API_KEY'),
});
export const env = envSchema.parse(process.env); //对环境变量进行校验
//# sourceMappingURL=env.js.map