import { useState } from 'react'
import ResultList from '../components/ResultList'
import SearchForm from '../components/SearchForm'
import SummaryPanel from '../components/SummaryPanel'
import './App.css'

interface Chunk {
  ids: string,
  content: string
  source: string
  title: string
  filePath: string
  type: string
}
function App() {
  const [word, setWord] = useState('')
  const [list, setList] = useState<Chunk[]>([
    {
      ids: '',
      content: '向量数据库检索',
      source: '',
      title: '',
      filePath: '',
      type: ''
    }
  ])
  const [data, setData] = useState('AI生成总结')


  //1返回list
  async function ragSearch(keyword: string, setState: (text: Chunk[]) => void)
    : Promise<Chunk[]> {
    //该网页无法正常运作
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword,
      }),
    })
    if (!res.ok) {
      throw new Error('检索rag知识库失败')
    }
    //这里直接渲染到页面上
    const list = (await res.json()) as Chunk[]//数据预期是对象数组

    setState(list)
    return await list
  }

  //2流式返回ai总结内容
  async function aiSummary(
    keyword: string,
    list: Chunk[],
    setState: (text: string) => void)
    : Promise<string>  //最终返回字符串
  {
    //该网页无法正常运作
    //请求头
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword,
        list
      }),
    })

    if (!res.ok) {
      throw new Error('发送LLM请求失败')
    }
    //读取流式输出
    // 获取响应体(ReadableStream)
    const reader = res.body?.getReader()

    if (!reader) {
      throw new Error('无法读取流')
    }

    // 把 二进制字节数据 转成字符串
    const decoder = new TextDecoder()
    let result = ''
    //不断读取流
    while (true) {
      // 读取下一段数据
      const { done, value } = await reader.read()

      // 流结束 退出循环
      if (done) {
        break
      }

      // 二进制转字符串
      const chunk = decoder.decode(value)

      // 拼接最终结果
      result += chunk

      // 通知外部更新UI
      setState(result)
    }


    //拿到最终完成结果
    return result


  }

  // // 接收数据 根据结果更新页面
  // async function fetchData(keyword: string) {
  //   const result = await Searchkeyword(keyword)
  //   console.log('fetchData接受到的数据', result)
  //   //请求结束之后更新
  //   console.log('apptsx返回的summary类型', typeof result.summary)
  //   setData(result.summary)
  //   setList(result.list)
  // }

  // 点击按钮之后
  async function handleSearch(value: string) {
    const keyword = value.trim()
    setWord(value)

    // 处理空值
    if (!keyword) {
      setList([
        {
          ids: '',
          content: '请输入需要检索的问题',
          source: '',
          title: '',
          filePath: '',
          type: ''
        }
      ])
      setData('输入关键词后 ai分析给出总结')
      return
    }

    //加载状态
    setList([
      {
        ids: '',
        content: `正在分析中`,
        source: '',
        title: '',
        filePath: '',
        type: ''
      }
    ])
    setData(`正在分析中,关键词${keyword}`)

    //捕获异常
    try {
      //1内容embedding
      const list = await ragSearch(keyword, setList)
      //2合成prompt调用ai
      await aiSummary(keyword, list, setData)
    } catch (error) {
      setList([
        {
          ids: '',
          content: '检索失败',
          source: '',
          title: '',
          filePath: '',
          type: ''
        }
      ])
      setData(error instanceof Error ? error.message : '后端未成功返回搜索结果或 AI 总结，请检查接口状态、返回数据格式，或稍后重试')
    }
  }

  return (
    <>
      <SearchForm word={word} onSearch={handleSearch} />

      {/* 显示搜索结果前五条 */}
      <ResultList list={list} />

      {/* 显示ai总结文本 */}
      <SummaryPanel data={data} />
    </>
  )
}

export default App
