// 扫描 server/data/docs 下的 Markdown 文档
// 返回文档列表，并读取、清洗、切片成 RAG 可用的 chunks

import fs from 'node:fs'
import path from 'node:path'
import type { Chunk } from '../../types/rag.js'


//文档列表
type ListType = {
  // 文档根目录
  source: string,
  // 文档绝对路径
  absPath: string,
  // 相对 rootDir 的文档路径
  filePath: string,
  content: string
}

//代码块
type CodeBlocksType = {
  lang: string,
  content: string
}

type SplitCodeBlocksType = {
  textContent: string,
  codeBlocks: CodeBlocksType[]
}

//
type CutTextContentType = {
  content: string,
  type: string
}

//
type SectionType = {
  title: string,
  content: string,
  length: number,
}


// 判断文件是否是 Markdown 或 MDX 文件
function isMarkdownFile(fileName: string) {
  let tip = path.extname(fileName)
  if (tip === '.md' || tip === '.mdx') {
    return true
  }
}

// 递归遍历目录，返回符合条件的文档文件列表
// currentDir 是当前扫描目录，rootDir 是相对路径计算的根目录
function scanDocs(currentDir: string, rootDir: string): ListType[] {
  // 读取当前目录下的所有文件和子目录
  let Dirent = fs.readdirSync(currentDir, { withFileTypes: true })
  let list = []
  // 遍历目录项，收集 Markdown 文件
  for (let item of Dirent) {
    // 如果是文件，并且后缀是 .md 或 .mdx，就加入文档列表
    if (item.isFile() && isMarkdownFile(item.name)) {
      let absPath = path.join(currentDir, item.name)
      // 保存文档的来源路径、绝对路径和相对路径
      list.push({
        // 文档根目录
        source: rootDir,
        // 文档绝对路径
        absPath: absPath,
        // 相对 rootDir 的文档路径
        filePath: path.relative(rootDir, absPath),
        content: ''
      })
    }
    if (item.isDirectory()) {
      let dir = path.join(currentDir, item.name)
      list.push(
        ...scanDocs(dir, rootDir)
      )
    }
  }
  // console.log('1 返回文档文件列表', list)
  return list
}


function loadDocs(list: ListType[]): ListType[] {
  for (let item of list) {
    console.log('---------', item.absPath)
    let content = fs.readFileSync(item.absPath, 'utf8')
    item.content = content
  }
  // console.log('2 读取正文后的文档列表', list)
  return list
}

// 清洗文档正文，去掉不适合参与检索的内容
function cleanDocs(list: ListType[]): ListType[] {
  for (let item of list) {
    // 使用正则清理 frontmatter、HTML 注释、过多空行、独立链接和编辑入口
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
  // console.log('0 清洗之后的文档列表', list)
  return list
}

// 按标题优先切分；正文和代码块分开处理，避免代码片段污染语义检索
function cutDocs(lists: ListType[]): Chunk[] {
  let chunks = []
  // 如果正文段落仍然过长，再按固定长度切分
  // 最终把所有 chunk push 到 chunks
  for (let list of lists) {
    // 先按标题切成多个 section
    let sections = splitByHeadings(list.content)

    let maxLength = 500
    // let maxLength = 100 // 测试用长度
    for (let section of sections) {
      //这里返回的是去掉代码块的正文,从正文中提取出的代码块数组
      let { textContent, codeBlocks } = splitCodeBlocks(section.content)
      let sectionChunks = cutTextContent(textContent, maxLength)

      //这里保存正文切片结果
      for (let sectionChunk of sectionChunks) {
        chunks.push({
          content: sectionChunk.content,

          metadata: {
            source: list.source,
            filePath: list.filePath,
            title: section.title,
            type: sectionChunk.type,
            length: sectionChunk.content.length
          }
        })
      }

      //这里保存代码块
      for (let codeBlock of codeBlocks) {
        // console.log('2-----代码块的chunks结构', {
        //   content: codeBlock.content,

        //   metadata: {
        //     source: list.source,
        //     filePath: list.filePath,
        //     title: section.title,
        //     type: 'code',
        //     lang: codeBlock.lang,
        //     length: codeBlock.content.length
        //   }
        // })
        // console.log('0-----------保存代码块')
        chunks.push({
          content: codeBlock.content,

          metadata: {
            source: list.source,
            filePath: list.filePath,
            title: section.title,
            type: 'code',
            lang: codeBlock.lang,
            length: codeBlock.content.length
          }
        })
      }
    }
  }
  return chunks
}

function splitCodeBlocks(content: string): SplitCodeBlocksType {
  //存放代码块
  let codeBlocks: CodeBlocksType[] = []

  let textContent = content.replace(/```([^\n]*)\n([\s\S]*?)```/g,
    //当正则匹配到内容时，会执行这个函数，并把匹配结果传进来。
    //整个代码块,语言类型,代码内容
    function (match, lang, code) {
      // console.log(`0------match匹配结果${match},lang匹配结果${lang},code代码${code}}`)
      codeBlocks.push({
        lang: lang.trim(),
        content: code.trim()
      })

      //原文中的代码块替换成空行
      return '\n\n'
    })
  // console.log('1------splitCodeBlocks处理完毕')
  return {
    textContent: textContent.trim(),
    codeBlocks
  }
}

function cutTextContent(content: string, maxLength: number): CutTextContentType[] {
  let chunks: CutTextContentType[] = []

  if (!content) {
    return chunks
  }

  // 如果 section 不长，直接生成一个 section chunk
  if (content.length <= maxLength) {
    chunks.push({
      content,
      type: 'section'
    })
    return chunks
  }

  // 如果 section 太长，继续按段落拆分
  // 按空行切分段落
  let paragraphs = splitByParagraph(content, maxLength)
  for (let paragraph of paragraphs) {
    // 段落不超过最大长度时，直接生成 paragraph chunk
    if (paragraph.length <= maxLength) {
      chunks.push({
        content: paragraph,
        type: 'paragraph'
      })
    } else {
      let overlap = 100
      // 段落仍然过长时，按固定长度继续切分
      let chunk = splitByLength(paragraph, maxLength, overlap)
      for (let text of chunk) {
        chunks.push({
          content: text,
          type: 'length'
        })
      }
    }
  }

  return chunks
}

// 按 Markdown 标题切分文档内容
function splitByHeadings(content: string): SectionType[] {
  const lines = content.split('\n')
  const sections = []
  let currentLines = [], currentTitle = 'Document'

  for (const line of lines) {
    // 判断当前行是否是 Markdown 标题

    // 遇到新标题时，先保存上一个 section
    if (/^#{1,6}\s+/.test(line) && currentLines.length > 0) {
      // 保存上一段内容，并保留换行结构
      sections.push({
        title: currentTitle,
        content: currentLines.join('\n').trim(),
        length: currentLines.length
      })
      // 开启新的 section
      // 保存新的标题文本
      currentTitle = line.replace(/^#{1,6}\s+/, '')
      currentLines = []
    }
    // 把当前行加入当前 section
    currentLines.push(line)
  }

  // 循环结束后，保存最后一个 section
  if (currentLines.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentLines.join('\n').trim(),
      length: currentLines.length,
    })
  }
  // console.log('------1 按标题切分', sections)
  return sections
}

// 按段落切分 section 内容
function splitByParagraph(section: string, maxLength: number) {
  let res = section
    .split(/\r?\n\r?\n+/) // 按一个或多个空行切分段落
    .map(item => item.trim()) // 去掉每段前后的空白
    .filter(Boolean) // 去掉空字符串
  // console.log('------2 按段落切分', res)
  return res
}



// 按固定长度切分文本
function splitByLength(text: string, maxLength = 500, overlap = 100) {
  let chunks = []
  let start = 0

  while (start < text.length) {
    let end = start + maxLength

    chunks.push(
      text.slice(start, end)
    )

    // 向后移动，同时保留 overlap 长度的上下文
    start = end - overlap
  }
  // console.log('------3 按固定长度切分', chunks)
  return chunks
}


function dealDocs(rootDir: string): Chunk[] {
  // 1. 扫描文档文件列表
  let list1 = scanDocs(rootDir, rootDir)
  // 2. 读取文档正文
  let list2 = loadDocs(list1)
  // 3. 基础清洗正文
  let list3 = cleanDocs(list2)
  // 4. 切片
  let res1 = cutDocs(list3)
  // 给每个 chunk 添加 chunksIndex 和唯一 id
  for (let i = 0; i < res1.length; i++) {
    //这里要首先判断当前元素是否存在
    const chunk = res1[i]

    if (!chunk) {
      continue
    }
    chunk.chunksIndex = i
    chunk.id = `${chunk.metadata.filePath}${chunk.chunksIndex}`
  }
  // console.log('------4 最终结果', res1)

  return res1
}

// dealDocs('server\\data\\docs\\react')
// dealDocs('server\\data\\docs\\vite')


export default dealDocs
