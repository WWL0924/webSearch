//导入
const OpenAI = require("openai");//类



//创建客户端
const client = new OpenAI({
  // 必须指定阿里云的兼容接口地址
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  // key
  // apiKey: process.env.DASHSCOPE_API_KEY,
  apiKey: `sk-983d123cb18945058f56c1fb17691b57`


});
//根据提取出的内容给ai
async function AIsummary(keyword, list) {
  //调用ai
  const response = await client.responses.create({
    //模型
    model: 'qwen-plus',
    input: `${keyword} + ${list}`

    // //聊天记录(上下文)
    // messages: [
    //   {
    //     role: "system", //系统提示词 ai扮演的角色
    //     content: "你是一个前端文档助手"
    //   },
    //   {
    //     role: "user", //用户
    //     content: "解释一下useEffect"
    //   }
    // ]
  });
  // console.log('1输入', input)
  //返回的数据
  //   {
  //   choices: [
  //     {
  //       message: {
  //         role: "assistant",
  //         content: "useEffect 是 React 提供的副作用 Hook..."
  //       }
  //     }
  //   ]
  // }
  console.log('2返回的respons结构', response.output_text)
  // const answer =
  //   response.choices[0].message.content;//只取第一个回答
  return response.output_text
  // return '222ai返回'
}

module.exports = AIsummary;

AIsummary('slice', '获取子字符串.JavaScript 中有三种获取字符串的方法：substring、substr 和 slice… str.slice(start [, end])返回字符串从 start 到（但不包括）end 的部分我们可以用 slice… 参数值类似于 array.slice，也允许是负数slice.arr.slice… 它和字符串的 str.slice 方法有点像，就是把子字符串替换成子数组然后，我们可以使用 Blob 和 slice 方法来发送从 startByte 开始的文件：我们甚至可以基于 Array.from 创建代理感知（surrogate-aware）的slice 方法（译注：也就是能够处理 UTF-16 扩展字符的 slice 方法）：')