//注册中间件 挂载路由
import express from "express";
import ragsearch from "./routes/search.js";
import AIRouter from "./routes/ai.js";
import sourceRouter from './routes/sources.js';
import reportsRouter from './routes/reports.js';
import agentRouter from './routes/agent.js';
//注册工具
import { registerTool } from './agent/toolRegistry.js';
import { tools } from './agent/tools/index.js';
for (const tool of tools) {
    registerTool(tool); //存入map
}
//启动服务 入口文件 总路由
const app = express();
//注册中间件 
app.use(express.json()); //前端接收的数据自动挂到req.body
//挂载路由
app.use('/api/search', ragsearch);
app.use('/api/ai', AIRouter);
app.use('/api/sources', sourceRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/agent', agentRouter);
//启动服务器监听3000端口
app.listen(3000, () => {
    console.log("后端启动");
});
//# sourceMappingURL=app.js.map