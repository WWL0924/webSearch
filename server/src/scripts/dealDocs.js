//扫描 server/data/docs 下的 Markdown 文件
// 返回候选文件列表 并且提取出正文

const fs = require('fs')
const path = require('path')

//判断文件类型
function isMarkdownFile(fileName) {
  let tip = path.extname(fileName)
  if (tip === '.md' || tip === '.mdx') {
    return true
  }
}

//递归遍历目录 返回文件列表
//当前路径 相对路径的起点
function scanDocs(currentDir, rootDir) {
  //读取目录下所有内容 返回对象数组
  let Dirent = fs.readdirSync(currentDir, { withFileTypes: true })
  let list = []
  //文件类型是 加入遍历目录
  for (let item of Dirent) {
    //如果是文件且格式正确
    if (item.isFile() && isMarkdownFile(item.name)) {
      let absPath = path.join(currentDir, item.name)
      //返回遍历目录
      list.push({
        //根目录
        source: rootDir,
        //文件绝对路径
        absPath: absPath,
        //相对 rootDir 的路径
        filePath: path.relative(rootDir, absPath),
      })
    }
    if (item.isDirectory()) {
      let dir = path.join(currentDir, item.name)
      list.push(
        ...scanDocs(dir, rootDir)
      )
    }
  }
  // console.log('1返回文件列表', list)
  return list
}


function loadDocs(list) {
  for (let item of list) {
    console.log('---------', item.absPath)
    let content = fs.readFileSync(item.absPath, 'utf8')
    item.content = content
  }
  console.log('2带内容的文件列表', list)
  return list
}

//
function cleanDocs(list) {
  for (let item of list) {
    //正则表达式清洗
    item.content = item.content.replace(
      /^---[\s\S]*?---\n?/,
      ''
    )
      .replace(/\r\n/g, '\n')
      .replace(
        /<!--[\s\S]*?-->/g,
        ''
      ).replace(
        /\n{3,}/g,
        '\n\n'
      ).replace(
        /^-\s*\[.*?\]\(.*?\)$/gm,
        ''
      ).replace(
        /Edit this page.*$/gm,
        ''
      )
  }
  console.log('0--------清洗之后的文本', list)
  return list
}

//标题优先，段落兜底，长度超限再细分
function cutDocs(lists) {
  let chunks = []
  // 6. 如果段落块还太长，再按固定长度切
  // 7. 把最终 chunk push 到 chunks
  for (let list of lists) {
    // 2. 先按标题切成多个 section
    let sections = splitByHeadings(list.content)

    // let maxLength = 1000
    let maxLength = 100
    for (let section of sections) {
      // 4. 如果 section 不长，直接生成一个 chunk
      if (section.content.length <= maxLength) {
        chunks.push({
          content: section.content,

          metadata: {
            source: list.source,
            filePath: list.filePath,
            title: section.title,
            type: 'section',
            length: section.content.length
          }
        })
      }
      // 5. 如果太长，继续按段落拆
      else {
        //按照段落切分
        let paragraphs = splitByParagraph(section.content)
        for (let paragraph of paragraphs) {
          //不超过直接生成chunk
          if (paragraph.length <= maxLength) {
            chunks.push({
              content: paragraph,
              metadata: {
                //这里信息继承list上级
                source: list.source,
                filePath: list.filePath,
                title: section.title,
                type: 'paragraph',
                length: paragraph.length

              }
            })
          } else {
            let overlap = 100
            //超过 按固定长度分
            let chunk = splitByLength(paragraph, maxLength, overlap)
            for (let text of chunk) {

              chunks.push({

                content: text,

                metadata: {
                  source: list.source,
                  filePath: list.filePath,
                  title: section.title,
                  type: "length",
                  length: text.length

                }

              })

            }

          }
        }
      }

    }

  }
  return chunks
}


//按照标题切分
function splitByHeadings(content) {
  const lines = content.split('\n')
  const sections = []
  let currentLines = [], currentTitle = 'Document'

  for (const line of lines) {
    //标题开头的文本快

    //遇到新标题
    if (/^#{1,6}\s+/.test(line) && currentLines.length > 0) {
      //保存上一章(这里保存换行)
      sections.push({
        title: currentTitle,
        content: currentLines.join('\n').trim(),
        length: currentLines.length
      })
      //开启新章节
      //存入新的标题
      currentTitle = line.replace(/^#{1,6}\s+/, '')
      currentLines = []
    }
    //当前行加入当前章节
    currentLines.push(line)
  }

  //循环结束之后保存最后一章
  if (currentLines.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentLines.join('\n').trim(),
      length: currentLines.length,
    })
  }
  console.log('------1按照标题切分', sections)
  return sections
}

//按照段落切分
function splitByParagraph(section, maxLength) {
  let res = section
    .split(/\r?\n\r?\n+/) // 按一个或多个空行切分段落
    .map(item => item.trim()) // 去掉每段前后空白
    .filter(Boolean) // 去掉空字符串
  console.log('------2按照段落切分', res)
  return res
}



//按照固定长度切分
function splitByLength(text, maxLength = 1000, overlap = 100) {
  let chunks = []
  let start = 0

  while (start < text.length) {
    let end = start + maxLength

    chunks.push(
      text.slice(start, end)
    )

    //向后移动，但是保留 overlap 部分上下文
    start = end - overlap
  }
  console.log('------3按照固定长度切分', chunks)
  return chunks
}











function dealDocs(rootDir) {
  //1扫描文件列表
  let list1 = scanDocs(rootDir, rootDir)
  //2读出文件正文
  let list2 = loadDocs(list1)
  //3基础清洗正文
  let list3 = cleanDocs(list2)
  //4切片
  let res1 = cutDocs(list3)
  //这里还需要添加chunksIndex和id{res.metadata.filePath}
  for (let i = 0; i < res1.length; i++) {
    res1[i].chunksIndex = i
    res1[i].id = `${res1[i].metadata.filePath}${res1[i].chunksIndex}`
  }
  console.log('------4最终结果', res1)

  return res1
}

// dealDocs('server\\data\\docs\\react')
// dealDocs('server\\data\\docs\\vite')
dealDocs('server\\data\\docs\\test')

