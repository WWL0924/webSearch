//解析html
const cheerio = require('cheerio');
console.log(process.env.HTTP_PROXY)
console.log(process.env.HTTPS_PROXY)
console.log(process.env.NODE_USE_ENV_PROXY)

//这里选js中文站
const url = 'https://zh.javascript.info/'
//这里关键词搜索之后的url
function keywordUrl(keyword) {
  console.log('1关键词搜索url', `https://zh.javascript.info/search/?query=${keyword}&type=article`)
  return `https://zh.javascript.info/search/?query=${keyword}&type=article`
}
//直接提取搜索结果(这样只需要爬一个网址很方便)
//发送http请求
async function fetchData(url) {
  try {
    const req = await fetch(url)
    //生成html字符串
    const res = await req.text()
    // console.log('2提取html字符串', res)
    return res
  }
  catch (err) {
    console.log('2http请求失败', err)
  }
}

//解析html
function cheerioHTML(string) {
  const $ = cheerio.load(string);
  const list = []
  //搜索结果小于5时
  let length = $(".search-results__extract").length
  let len = Math.min(length, 5)
  //这里都是0
  console.log('3.1抓取数量', length, len)
  //抓取前五条
  for (let i = 0; i < len; i++) {
    //只保留100字
    let str = $(".search-results__extract").eq(i).text()
    //去除\n
    str = str.replace(/\n/g, '');
    //去除一长串的空格
    str = str.replace(/\s+/g, ' ');
    console.log('3.2抓取的信息', str)
    //截取第一个句号之前的句子
    let target1 = str.indexOf("。")
    let target = target1 === -1 ? 100 : target1
    console.log('3.3最终截取字数', target)
    list.push(str.slice(0, target))
  }
  console.log('3解析html', list)
  return list
}

//主函数
async function searchList(keyword) {
  let url = keywordUrl(keyword)
  let htmlString = await fetchData(url)
  // let htmlString = await fetchData('https://www.baidu.com')

  //解析html
  let res = cheerioHTML(htmlString)
  console.log('抓取结果', res)
  return res
}
// searchList('slice')

module.exports = searchList;