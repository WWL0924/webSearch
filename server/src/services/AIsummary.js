//从ai拿到片段 持续写出

//导入
const OpenAI = require("openai");//类



//创建客户端
const client = new OpenAI({
  // 必须指定阿里云的兼容接口地址
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  // key
  apiKey: process.env.DASHSCOPE_API_KEY,


});
//根据提取出的内容给ai
async function AIsummary(keyword, list, res) {

  //你让 AI用流式方式把模型结果返回给Node服务
  const response = await client.responses.create({
    //模型
    //这里要换成回复更快的模型么
    model: 'qwen-plus',
    input: `${keyword} + ${list}`,
    //开启流式传输
    stream: true
  });

  //不断监听ai返回的数据
  for await (const event of response) {
    //如果是新增的文本
    if (event.type === "response.output_text.delta") {
      //发送给前端
      res.write(event.delta);
    }
  }

  //最后结束
  res.end();
}

module.exports = AIsummary;

//AIsummary('slice', '获取子字符串.JavaScript 中有三种获取字符串的方法：substring、substr 和 slice… str.slice(start [, end])返回字符串从 start 到（但不包括）end 的部分我们可以用 slice… 参数值类似于 array.slice，也允许是负数slice.arr.slice… 它和字符串的 str.slice 方法有点像，就是把子字符串替换成子数组然后，我们可以使用 Blob 和 slice 方法来发送从 startByte 开始的文件：我们甚至可以基于 Array.from 创建代理感知（surrogate-aware）的slice 方法（译注：也就是能够处理 UTF-16 扩展字符的 slice 方法）：')