//注册中间件 挂载路由

//导入key
import dotenv from "dotenv"
import express from "express";
import ragsearch from "./routes/search.js";
import AIRouter from "./routes/ai.js";

dotenv.config()

console.log('1---导入的key', process.env.DASHSCOPE_API_KEY)
//启动服务 入口文件 总路由
const app = express();
//注册中间件 
app.use(express.json()); //前端接收的数据自动挂到req.body
//挂载路由
app.use('/api/search', ragsearch);
app.use('/api/ai', AIRouter);



//启动服务器监听3000端口
app.listen(3000, () => {
  console.log("server running");
});
