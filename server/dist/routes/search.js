//返回list的接口
import express from 'express';
import ragserach from '../services/rag/ragSearch.js';
import { ragSearchInputSchema } from '../schemas/search.schema.js';
//创建路由实例
const router = express.Router();
router.post('/', async (req, res) => {
    try {
        //验证
        const result = ragSearchInputSchema.safeParse(req.body);
        //这里返回的
        //  { success: true, data: { keyword: "react",sources:[] } }
        if (!result.success) {
            console.log('search路由错误', result.error.issues);
            return res.status(400).json({
                message: '请求参数错误',
                error: result.error,
            });
        }
        // const { keyword = '', sources = [] } = result.data;
        const ragSearchInput = result.data;
        console.log('1ragserach输入值', ragSearchInput);
        const list = await ragserach(ragSearchInput);
        return res.json(list);
    }
    catch (error) {
        //rag执行错误写在这里?
        console.log('ragsearch服务请求失败', error);
        res.status(500).json({
            list: [],
            message: error instanceof Error ? error.message : '搜索失败',
        });
    }
});
export default router;
//# sourceMappingURL=search.js.map