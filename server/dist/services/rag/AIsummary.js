//从ai拿到片段 持续写出
//导入
import OpenAI from "openai"; //类
import { env } from '../../config/env.js';
//创建客户端
const client = new OpenAI({
    // 必须指定阿里云的兼容接口地址
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    // key
    apiKey: env.DASHSCOPE_API_KEY,
});
//根据提取出的内容给ai
async function AIsummary(keyword, list, codeResults, res) {
    console.log('######传入的文本和代码', list, ",", codeResults);
    const contentArr = list.map(item => {
        return item.content;
    });
    console.log('****AIsummary处理', contentArr, contentArr.length);
    //代码块单独列出，避免和正文混在一起影响总结
    const codeArr = (codeResults ?? []).map(item => {
        return `\`\`\`${item.lang ?? ''}\n${item.content}\n\`\`\``;
    });
    console.log('$$$$有代码结果', codeArr);
    const prompt = `
# 用户问题
${keyword}
# 相关上下文
${contentArr}
${codeArr.length > 0 ? `# 相关代码示例\n${codeArr.join('\n\n')}\n` : ''}
# 任务要求
请根据上面的上下文回答用户问题。

要求：
1. 只使用提供的上下文信息回答。
2. 如果上下文没有相关信息，请明确说明不知道。
3. 回答要简洁准确。
4. 不要输出与问题无关的内容。
5. 如果相关代码示例对回答有帮助，可结合代码说明用法；无关则忽略。
`;
    //如果传的是空数组,直接返回
    if (list.length === 0) {
        console.log('********这里不调用LLM直接返回', prompt);
        res.write('当前知识库没有相关资料');
        res.end();
        return;
    }
    console.log('********ai拼接的prompt', prompt);
    //你让 AI用流式方式把模型结果返回给Node服务
    const response = await client.responses.create({
        //模型
        model: 'qwen3.8-flash',
        input: prompt,
        //开启流式传输
        stream: true
    });
    console.log('开启流式传输');
    //不断监听ai返回的数据
    for await (const event of response) {
        // console.log('ai事件监听', event.type, event)
        //如果是新增的文本
        if (event.type === "response.output_text.delta") {
            //发送给前端
            res.write(event.delta);
        }
    }
    console.log('结束流式传输');
    //最后结束
    res.end();
}
export default AIsummary;
//AIsummary('slice', '获取子字符串.JavaScript 中有三种获取字符串的方法：substring、substr 和 slice… str.slice(start [, end])返回字符串从 start 到（但不包括）end 的部分我们可以用 slice… 参数值类似于 array.slice，也允许是负数slice.arr.slice… 它和字符串的 str.slice 方法有点像，就是把子字符串替换成子数组然后，我们可以使用 Blob 和 slice 方法来发送从 startByte 开始的文件：我们甚至可以基于 Array.from 创建代理感知（surrogate-aware）的slice 方法（译注：也就是能够处理 UTF-16 扩展字符的 slice 方法）：')
//# sourceMappingURL=AIsummary.js.map