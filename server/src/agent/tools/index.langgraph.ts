import { ragTool } from './ragsearch.langgraph.tool.js'
import { readTool } from './readdocsection.langgraph.tool.js'
import { createTool } from './createmarkdown.langgraph.tool.js'

export const langgraphTools = [
  ragTool,
  readTool,
  createTool
]

//验证工具适配成功
// console.log(langgraphTools.map(tool => tool.name))