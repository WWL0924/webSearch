//返回list的接口
import express from 'express';
import searchList from '../services/rag/ragSearch.js';
import { searchSchema } from '../schemas/search.schema.js'


//创建路由实例
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    //验证
    const result = searchSchema.safeParse(req.body);
    //这里返回的
    //  { success: true, data: { keyword: "react" } }
    if (!result.success) {
      return res.status(400).json({
        message: '请求参数错误',
        error: result.error,
      });
    }
    const { keyword = '' } = result.data;
    console.log('1-----解析keyword', keyword)
    const list = await searchList(keyword);
    return res.json(list);
  } catch (error) {
    console.log('---------------后端请求失败', error)
    res.status(500).json({
      list: [],
      message: error instanceof Error ? error.message : '搜索失败',
    });
  }
});

export default router;
