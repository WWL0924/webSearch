//Agent 中：按需读原文补上下文

import fs from 'node:fs'
import path from 'node:path'
import { DOCS_DIR } from '../../config/paths.js'
import { AgentError } from '../../agent/errors.js'
import { type readDocSectionInputType, type readDocSectionOutputType, readDocSectionOutputSchema } from '../../schemas/read.schema.js'


type MarkdownHeading = {
  level: number
  title: string
}

// 去掉文档标题中的锚点等额外标记，便于和用户输入比较。
function cleanHeadingTitle(headingTitle: string): string {
  return headingTitle
    // React 文档标题锚点，例如：## 用法 {/*usage*/}
    .replace(/\s*\{\/\*.*?\*\/\}\s*$/, '')
    // Vite 文档标题锚点，例如：## 用法 {#usage}
    .replace(/\s*\{#[^}]*\}\s*$/, '')
    // Markdown 可选的结尾井号，例如：## 用法 ##
    .replace(/\s+#+\s*$/, '')
    // 去掉包裹整个标题的反引号。
    .replace(/^`(.+)`$/, '$1')
    .trim()
    .toLowerCase()
}

// 从一行 Markdown 文本中读取标题等级和标题内容。
// 例如 "### 用法" 会被解析为 level: 3、title: "用法"。
// 标题等级数字越小，层级越高：# 是 1，## 是 2，### 是 3。
function parseHeadingLine(line: string): MarkdownHeading | null {
  //识别标准的标题
  const headingMatch = line.match(/^(#{1,6})[ \t]+(.+?)[ \t]*$/)
  //headingMatch[0] // '### 用法'，完整匹配内容
  // headingMatch[1] // '###'，标题标记
  // headingMatch[2] // '用法'，标题内容
  if (!headingMatch?.[1] || !headingMatch[2]) {
    return null
  }
  return {
    level: headingMatch[1].length,
    title: headingMatch[2]
  }
}

// 按标题查找章节，并保留目标标题下的所有子标题内容。
// 遇到同级或更高级标题时，说明当前章节结束。
function findMarkdownSection(
  content: string,
  section: string
): string | null {
  //按换行符切分出数组
  const lines = content.split(/\r?\n/)
  //处理标题
  const normalizedRequestedSection = cleanHeadingTitle(section)
  //匹配到的标题等级
  let matchedHeadingLevel: number | null = null
  const sectionLines: string[] = []

  for (const line of lines) {
    //当前标题位置
    const currentHeading = parseHeadingLine(line)
    // 还没有找到目标章节。
    if (matchedHeadingLevel === null) {
      //是否找到目标章节

      const isRequestedHeading =
        currentHeading !== null &&
        //处理之后的标题要和用户输入的一模一样
        cleanHeadingTitle(currentHeading.title) === normalizedRequestedSection
      //找到目标章节
      if (isRequestedHeading) {
        //匹配到的章节等级
        matchedHeadingLevel = currentHeading.level
        sectionLines.push(line)
      }
      continue
    }
    // 标题等级数字越小，层级越高；遇到同级或更高级标题时停止读取。
    const hasReachedNextSection =
      currentHeading !== null &&
      currentHeading.level <= matchedHeadingLevel

    //遇到更高级或同级标题,停止读取
    if (hasReachedNextSection) {
      break
    }

    sectionLines.push(line)
  }

  //整个循环结束
  //没找到目标章节 不能返回空字符串
  if (matchedHeadingLevel === null) {
    return null
  }
  return sectionLines.join('\n').trim()
}


function readDocSection(readDocSectionInput: readDocSectionInputType): readDocSectionOutputType {
  const { filePath, section } = readDocSectionInput

  // Agent 传入的 filePath 相对于 server/data/docs，例如 react/react/Component.md。
  // 文档目录由 config/paths.ts 统一给出
  //解析出绝对路径

  const targetFilePath = path.resolve(DOCS_DIR, filePath)

  // 解析后检查目标路径，防止通过 ../ 读取文档目录之外的文件。
  const isInsideDocsRoot =
    targetFilePath.startsWith(`${DOCS_DIR}${path.sep}`)

  if (!isInsideDocsRoot) {
    throw new AgentError('INVALID_INPUT', '禁止读取文档目录之外的文件', false)
  }

  let content: string
  try {
    content = fs.readFileSync(targetFilePath, 'utf-8')
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      throw new AgentError('DOCUMENT_NOT_FOUND', '指定文档不存在，请使用检索结果中的 filePath', false, error)
    }
    throw new AgentError('FILE_OPERATION_FAILED', '文档读取失败', false, error)
  }

  //指定章节就查找,未指定章节就直接输出这个文件内容
  const sectionContent = section ? findMarkdownSection(content, section)
    : content

  if (sectionContent === null) {
    throw new AgentError('DOCUMENT_SECTION_NOT_FOUND', `未找到章节：${section}`, false)
  }
  const res = { content: sectionContent, filePath, section: section || null }
  return readDocSectionOutputSchema.parse(res)
}

export default readDocSection
