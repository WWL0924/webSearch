const express = require('express');
const searchList = require('../services/searchList');
const AIsummary = require('../services/AIsummary');

//创建路由实例
const router = express.Router();

router.post('/search', async (req, res) => {
  try {
    const { keyword = '' } = req.body;
    console.log('1-----解析keyword', keyword)
    const list = await searchList(keyword);
    const summary = await AIsummary(keyword, list);
    return res.json({
      list,
      summary,
    });
  } catch (error) {
    console.log('---------------后端请求失败', error)
    res.status(500).json({
      list: [],
      summary: '',
      message: error instanceof Error ? error.message : '搜索失败',
    });
  }
});

module.exports = router;
