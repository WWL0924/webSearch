import { useEffect, useState } from 'react'
import ResultList from '../components/ResultList'
import SearchForm from '../components/SearchForm'
import SummaryPanel from '../components/SummaryPanel'
import './App.css'

function App() {
  const [word, setWord] = useState('搜索结果')
  const [url, setUrl] = useState('等待请求后端接口')
  const [data, setData] = useState('等待生成总结结果')

  useEffect(() => {
    if (!word.trim()) {
      setUrl('请输入搜索关键词')
      setData('请输入搜索关键词后再发起请求')
      return
    }

    setUrl(`等待请求 /api/search，当前关键词：${word}`)
    setData('后端返回结果后在这里展示总结内容')
  }, [word])

  return (
    <>
      <SearchForm
        word={word}
        onSearch={setWord}
      />

      <ResultList url={url} />

      <SummaryPanel data={data} />
    </>
  )
}

export default App
