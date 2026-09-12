//流式响应
//返回summary的接口
import express from 'express';
import AIsummary from '../services/rag/AIsummary.js';
import { aiSchema } from '../schemas/ai.schema.js';
//创建路由实例
const router = express.Router();
router.post('/', async (req, res) => {
    try {
        //用 aiSchema规则检查前端传过来的 req.body 是否符合要求。
        const result = aiSchema.safeParse(req.body);
        console.log('*********这里返回的result数据', result);
        //      success: true,
        //   data: {
        //     keyword: '常用的hooks',
        //     list: [ [Object], [Object], [Object], [Object], [Object] ]
        //   }
        // }
        //判断是否失败 
        if (!result.success) {
            return res.status(400).json({
                message: '参数错误',
                error: result.error
            });
        }
        const { keyword, list } = result.data;
        // const { keyword, list } = result;
        console.log('1ai-----解析keyword', keyword);
        //设置流式响应头
        //响应头发给前端 前端更早进入读取状态
        //纯文本 utf-8编码
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        //不缓存这次响应 (流式内容实时生成)
        res.setHeader('Cache-Control', 'no-cache');
        //不要立即关闭tcp连接
        res.setHeader('Connection', 'keep-alive');
        //发送响应头
        res.flushHeaders();
        //这里不要直接返回 是流式返回
        await AIsummary(keyword, list, res);
    }
    catch (error) {
        //判断响应阶段
        //1没开始 
        if (!res.headersSent) {
            //普通错误返回
            console.error('---------------响应还没开始', error);
            res.status(500).json(['后端返回失败', '错误' + error]);
        }
        //2开始响应但是还没结束
        else if (res.headersSent && !res.writableEnded) {
            return res.status(500).json({
                message: '后端返回失败'
            });
        }
        //3已经结束
        else if (res.writableEnded) {
            //记录日志
            res.write(`这里出现错误${error}`);
            res.end();
        }
    }
});
export default router;
//# sourceMappingURL=ai.js.map