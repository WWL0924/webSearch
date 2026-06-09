//返回list的接口
const express = require('express');
const searchList = require('../services/searchList');

//创建路由实例
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { keyword = '' } = req.body;
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

module.exports = router;
