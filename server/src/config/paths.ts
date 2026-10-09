//数据目录的唯一定义处,工具和路由都从这里取,避免两边各拼一遍路径

import path from 'node:path'
import { fileURLToPath } from 'node:url'

//从本文件位置往上找到 server 根目录,再进 data
//比 process.cwd() 稳:cwd 取决于从哪启动进程
const serverRoot = fileURLToPath(new URL('../../', import.meta.url))

//官方文档原始目录,readDocSection 只能读这里
export const DOCS_DIR = path.join(serverRoot, 'data', 'docs')

//报告输出目录,createMarkdown 只能写这里,下载路由只能读这里
export const REPORTS_DIR = path.join(serverRoot, 'data', 'reports')
