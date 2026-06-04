//word发送到后端 后端根据关键词检索文件
// 从这些网站中检索
// - `react.dev`
// - `vite.dev`
// - `nodejs.org`
// - `developer.mozilla.org`
// - `typescriptlang.org`
//list存放用到的网页
//summary存放ai总结
//返回{list:[{title,url}],summary:}结构的数据
//导入方法
const searchList = require('../services/searchList')
const AIsummary = require('../services/AIsummary')

const express = require("express");

const router = express.Router();

router.post("/search", (req, res) => {
  const { keyword } = req.body;//从req.body中解构出关键词
  //生成list
  let list1 = await searchList(keyword)
  //生成ai总结
  let summary1 = await AIsummary(keyword, list1)
  res.json({
    // list: [{
    //   title: 'react官方文档',
    //   url: 'react.dev'
    // }],
    list: list1,
    // summary: '生成的ai总结'
    summary: summary1
  });
});

module.exports = router;