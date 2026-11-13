//createmarkdown生成报告之后,路由读取文件返回给浏览器

import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { Transformer } from 'markmap-lib'
import { fillTemplate } from 'markmap-render'
import { REPORTS_DIR } from '../config/paths.js'

import type { Request, Response } from 'express'

const router = express.Router()
const transformer = new Transformer()

//白名单挡掉斜杠、反斜杠、冒号等一切路径拼接素材,穿越无从谈起
const SAFE_FILE_NAME = /^[\p{L}\p{M}\p{N}_.-]+-\d+(?:-map\.html|\.md)$/u

router.get('/:fileName', (req: Request, res: Response) => {
  //Express 5 的 params 类型是 string | string[],收窄成 string
  const rawFileName = req.params.fileName
  const fileName = Array.isArray(rawFileName) ? rawFileName[0] : rawFileName

  if (!fileName || !SAFE_FILE_NAME.test(fileName)) {
    return res.status(400).json({ message: '文件名不合法' })
  }

  //html 用 inline,思维导图直接开;md 用 attachment 下载
  const isHtml = path.extname(fileName) === '.html'
  const disposition = isHtml
    ? 'inline'
    : `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
  const filePath = path.join(REPORTS_DIR, fileName)

  //思维导图文件缺失时,尝试从同名 Markdown 重建
  if (isHtml && fileName.endsWith('-map.html') && !fs.existsSync(filePath)) {
    const mdFileName = `${fileName.slice(0, -'-map.html'.length)}.md`
    const mdPath = path.join(REPORTS_DIR, mdFileName)

    if (fs.existsSync(mdPath)) {
      try {
        const markdown = fs.readFileSync(mdPath, 'utf-8').replace(
          /\n## 思维导图\n\n\[打开交互式思维导图\]\([^\r\n]+\)\s*$/,
          '',
        )
        const { root, features } = transformer.transform(markdown)
        const assets = transformer.getUsedAssets(features)
        fs.writeFileSync(filePath, fillTemplate(root, assets), 'utf-8')
      } catch {
        return res.status(500).json({ message: '思维导图生成失败' })
      }
    }
  }

  res.sendFile(
    //下载路由读取刚刚createmarkdown存档的文件
    fileName,
    { root: REPORTS_DIR, headers: { 'Content-Disposition': disposition } },
    err => {
      if (!err || res.headersSent) return
      const fileError = err as NodeJS.ErrnoException & { status?: number; statusCode?: number }
      const notFound = fileError.code === 'ENOENT' || fileError.status === 404 || fileError.statusCode === 404
      res.status(notFound ? 404 : 500).json({
        message: notFound ? '报告不存在' : '读取报告失败',
      })
    },
  )
})

export default router
