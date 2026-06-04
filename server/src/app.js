//启动服务 入口文件 总路由
const express = require("express");
const searchRouter = require("./routes/search");

const app = express();
//注册中间件 
app.use(express.json()); //前端接收的数据自动挂到req.body
//挂载路由
app.use("/api", searchRouter);
//api/search请求交给处理("./api/search")文件处理

//启动服务器监听3000端口
app.listen(3000, () => {
  console.log("server running");
});