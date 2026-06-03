import { useState } from 'react'
import ResultList from '../components/ResultList'
import SearchForm from '../components/SearchForm'
import SummaryPanel from '../components/SummaryPanel'
import './App.css'

type SearchItem = {
  title: string
  url?: string
}

type SearchResponse = {
  list: SearchItem[]
  summary: string
}

function App() {
  const [word, setWord] = useState('')
  const [list, setList] = useState<SearchItem[]>([{ title: '请输入关键词 查找网页清单' }])
  const [data, setData] = useState('AI生成总结')

  //发送关键词 返回数据
  async function Searchkeyword(keyword: string): Promise<SearchResponse> {
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
      throw new Error('发送数据失败')
    }

    // 返回的数据结构 { list, summary }
    return res.json()
  }

  // 接收数据 根据结果更新页面
  async function fetchData(keyword: string) {
    const result = await Searchkeyword(keyword)
    //请求结束之后更新
    setData(result.summary)
    setList(result.list)
  }

  // 点击按钮之后
  async function handleSearch(value: string) {
    const keyword = value.trim()
    setWord(value)

    // 处理空值
    if (!keyword) {
      setList([{ title: '请输入关键词' }])
      setData('输入关键词后 ai分析给出总结')
      return
    }

    //加载状态
    setList([{ title: `正在分析中,关键词${keyword}` }])
    setData(`正在分析中,关键词${keyword}`)

    //捕获异常
    try {
      await fetchData(keyword)
    } catch (error) {
      setList([{ title: '搜索失败,请稍后重试' }])
      setData(error instanceof Error ? error.message : '后端未成功返回搜索结果或 AI 总结，请检查接口状态、返回数据格式，或稍后重试')
    }
  }

  return (
    <>
      <SearchForm word={word} onSearch={handleSearch} />
      <ResultList list={list} />
      <SummaryPanel data={data} />
    </>
  )
}

export default App
