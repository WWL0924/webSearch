import { useEffect, useState } from 'react'
import ResultList from '../components/ResultList'
import SearchForm from '../components/SearchForm'
import SummaryPanel from '../components/SummaryPanel'
import './App.css'
import type { ragResultItemType, ragCodeResultItemType, TypeSelectiOptions } from '../types/search'
import type { ragSearchOutputType } from '../../../server/src/schemas/search.schema'
import type { AgentStreamEvent } from '../../../shared/types/agent'
import type { eventsType } from '../types/agent'

import { Checkbox, Radio, Select } from 'antd'
import AgentProgress from '../components/AgentProgress'

type RagSearchDataType = ragSearchOutputType['data']

//请求或读取流失败时添加网络错误标记,保留原始异常
function rethrowNetworkError(error: unknown): never {
  //判断超时
  if (error instanceof Error && error.name === 'TimeoutError') {
    throw Object.assign(new Error('搜索处理超时，请稍后重试', {
      cause: error
    }), {
      code: 'REQUEST_TIMEOUT'
    })
  }


  //主动取消不属于网络错误
  if (error instanceof Error && error.name === 'AbortError') {
    throw error
  }

  //code属性添加到新创建的对象上
  throw Object.assign(new Error('请求或响应流读取失败', { cause: error }), {
    code: 'NETWORK_ERROR'
  })
}
// {
//   message: '请求或响应流读取失败',
//   cause: error,
//   code: 'NETWORK_ERROR'
// }

function createMessageResult(content: string): ragResultItemType {
  return {
    content, //只传入content,其他为空
    source: '',
    title: '',
    section: '',
    sourceUrl: '',
    score: 0,
    filePath: ''
  }
}




function App() {
  const [word, setWord] = useState('')

  //rusultlist组件显示
  const [textResults, setTextResults] = useState<ragResultItemType[]>([])
  const [codeResults, setCodeResults] = useState<ragCodeResultItemType[]>([])


  const [data, setData] = useState('AI生成总结')
  //用户显示选择sources
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  //select列表
  const [selectiOptions, setSelectioptions] = useState<TypeSelectiOptions>([])
  const [isMap, setIsMap] = useState<'true' | 'false' | 'auto'>('auto')
  const [ismd, setIsmd] = useState(false)

  //当前agent流程属于的阶段
  const [current, setCurrent] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [content, setContent] = useState<string>('')
  //保存历史记录
  const [events, setEvents] = useState<eventsType[]>([])

  const [tooCall, setToolCall] = useState<string[]>([])
  //下载链接
  //下载链接随对应的事件保存在 event.report 中

  // const [toolCallResult, setToolCallResult] = useState<string>('')


  //1页面初次加载获取select配置项
  useEffect(() => {
    async function fetchSelect() {
      try {
        const res = await fetch('/api/sources')

        if (!res.ok) {
          throw new Error('获取来源配置失败')
        }

        const data = (await res.json()) as TypeSelectiOptions
        setSelectioptions(data)
      } catch (error) {
        console.error('获取来源列表失败', error)
        setSelectioptions([])
      }
    }

    fetchSelect()
  }, [])



  //获取用户选择的source
  function handleSourceChange(values: string[]) {
    console.log('用户选择的source', values, '传入固定的source', ['agent'])

    setSelectedSources(values)

    //这里传入错误的source来进行测试
    // setSelectedSources(['agent'])

  }

  //接收流式响应
  async function agentLoop(keyword: string) {
    //超时
    const timeOut = ismd ? 180_000 : 120_000
    const signal = AbortSignal.timeout(timeOut);

    //该网页无法正常运作
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      //这里发送的json本身就是对象
      body: JSON.stringify({
        keyword,
        ismd,
        isMap,
        sources: selectedSources//前端选择的source返回后端
      }),
      signal//超时信号
    }).catch(error => rethrowNetworkError(
      signal.aborted ? signal.reason : error //如果出现超时,传递超时原因
    )) //有错误直接传入error执行函数


    //收到响应,状态码不在200-299
    if (!res.ok) {
      //读取后端错误信息
      const errorData = await res.json()
      throw new Error(errorData.message) //停止agentloop
    }
    console.warn('向agent发送请求')
    //读取流式输出
    // 获取响应体(ReadableStream)
    const reader = res.body?.getReader() //可选链运算符
    console.log('获取响应体', reader)

    if (!reader) {
      // throw new AgentError('NETWORK_ERROR', '无法读取流', false)
      throw new Error('无法读取流')
    }

    // 把 二进制字节数据 转成字符串
    const decoder = new TextDecoder()
    let lastEventType: AgentStreamEvent['type']
    let front = '' //待解析缓存
    const RagSearchData: RagSearchDataType = {
      textChunkCount: 0,
      codeChunks: [],
      textChunks: [],
    } //rag检索结果

    //不断读取流
    while (true) {
      // 读取下一段数据
      const { done, value } = await reader.read().catch(error => rethrowNetworkError(
        signal.aborted ? signal.reason : error //如果出现超时,传递超时原因
      )) //异步读取下一块数据

      // 流结束 退出循环
      if (done) {
        console.log('前端读取流结束')
        if (lastEventType === 'answer') {
          setCurrent(4)
          setEvents(prev => [
            ...prev,
            { step: 4, type: 'done', toolCall: [], content: '任务结束' }
          ])
        }

        break
      }

      // 二进制转字符串
      const chunk = decoder.decode(value, { stream: true })
      // 拼接最终结果
      front += chunk


      //循环处理缓冲区内的完整消息，直到只剩未完成部分
      while (front.includes('\n\n')) {
        const frontArr = front.split('\n\n')

        //去掉前缀的data
        const messageText = frontArr[0].replace(/^data:\s*/, '')
        const frontdata: AgentStreamEvent = JSON.parse(messageText)
        lastEventType = frontdata.type
        console.log('agent传给前端的frontdata', frontdata)

        //移除处理之后的信息和'\n\n'
        const cut = frontArr[0].length + 2
        // front = front.replace('\n\n', '')
        // front = front.replace(frontArr[0], '')
        front = front.slice(cut)


        const frontToolcall: AgentStreamEvent['toolCall'] = frontdata.toolCall

        //工具失败单独展示,继续等待模型后续处理
        if (frontdata.type === 'tool_error') {
          const errorContent = typeof frontdata.content === 'string' ? frontdata.content : '工具执行失败'
          setCurrent(2)
          setToolCall(frontToolcall ?? [])
          setContent(errorContent)
          setEvents(prev => [
            ...prev,
            {
              step: 2,
              type: 'tool_error',
              toolCall: frontToolcall ?? [],
              content: errorContent,
              code: frontdata.code,
              retryable: frontdata.retryable,
            }
          ])
          continue
        }

        //ragsearch工具调用结果
        if (frontdata.type === 'tool_result') {
          setCurrent(2)

          setToolCall(frontToolcall ?? [])//这里每个工具要加相应的中文介绍么
          //rag工具
          if (frontdata.toolCall?.includes('ragSearch')) {
            if (typeof frontdata.content !== 'string') {
              throw new Error('ragSearch 工具结果应为 JSON 字符串')
            }
            const frontcontent: ragSearchOutputType = JSON.parse(frontdata.content)

            console.warn('还需要再parse么', typeof frontcontent, typeof frontcontent.data)
            //codes和text存在
            const codes: ragCodeResultItemType[] = frontcontent.data.codeChunks
            const texts: ragResultItemType[] = frontcontent.data.textChunks

            codes.forEach(item => RagSearchData.codeChunks.push(item))

            //这里还要根据code和text分别存入
            texts.forEach(item => RagSearchData.textChunks.push(item))
            //本次任务累积结果
            RagSearchData.textChunkCount += texts.length


            // 通知外部更新UI
            setCurrent(2)
            setContent(`找到${texts.length}条文本结果,找到${codes.length}条代码结果`)


            setEvents(prev => [
              ...prev,
              { step: 2, type: 'tool_result', toolCall: frontToolcall ?? [], content: `找到${texts.length}条文本结果,找到${codes.length}条代码结果` }
            ])


            setCodeResults([...RagSearchData.codeChunks])
            setTextResults([...RagSearchData.textChunks])
          }
          //readDocSection
          else if (frontdata.toolCall?.includes('readDocSection')) {
            //显示工具名称即可
            {
              if (typeof frontdata.content !== 'string') {
                throw new Error('readDocSection 工具结果应为 JSON 字符串')
              }
              //这里补全的内容要显示到页面上么？
              const readResult: unknown = JSON.parse(frontdata.content)
              if (
                typeof readResult !== 'object' || readResult === null ||
                !('content' in readResult) || typeof readResult.content !== 'string'
              ) {
                throw new Error('readDocSection 未返回有效的文档内容')
              }
              // 进度区只展示读取状态，完整原文由后端提供给 Agent。
              const readSummary = '文档读取完成，已补充原文上下文'
              setContent(readSummary)
              setEvents(prev => [
                ...prev,
                { step: 2, type: 'tool_result', toolCall: frontToolcall ?? [], content: readSummary }
              ])

            }

          }
          else if (frontdata.toolCall?.includes('createMarkdown')) {
            //解析出文件名
            if (typeof frontdata.content !== 'string') {
              throw new Error('createMarkdown 工具结果应为 JSON 字符串')
            }
            //检查文件信息是否符合要求
            const filename: unknown = JSON.parse(frontdata.content)
            if (
              typeof filename !== 'object' || filename === null ||
              !('mdFileName' in filename) ||
              typeof filename.mdFileName !== 'string' || !filename.mdFileName.trim() ||
              !('mapFileName' in filename) ||
              (filename.mapFileName !== null &&
                (typeof filename.mapFileName !== 'string' || !filename.mapFileName.trim()))
            ) {
              throw new Error('createMarkdown 未返回有效的报告文件信息')
            }


            const mdFileName = filename.mdFileName
            const mapFileName = filename.mapFileName

            //拼接下载链接
            const mdUrl = `/api/reports/${encodeURIComponent(mdFileName)}`
            const mapUrl = mapFileName ? `/api/reports/${encodeURIComponent(mapFileName)}` : null
            //拼接下载地址
            setContent('报告已生成')


            setEvents(prev => [
              ...prev,
              {
                step: 2,
                type: 'tool_result',
                toolCall: frontToolcall ?? [],
                content: '报告已生成',
                report: { mdUrl, mapUrl },
              }
            ])
          }
          //收到其他工具进入这里
          else {
            const resultContent = typeof frontdata.content === 'string'
              ? frontdata.content
              : JSON.stringify(frontdata.content ?? '')
            setContent(resultContent)
            setEvents(prev => [
              ...prev,
              { step: 2, type: 'tool_result', toolCall: frontToolcall ?? [], content: resultContent }
            ])
          }
        }
        //llm返回调用工具列表
        else if (frontdata.type === 'tool_call') {
          setCurrent(1)
          //这里要展示在另一个组件里
          const str = frontToolcall?.join(',') ?? ''
          setContent(str)
          setEvents(prev => [
            ...prev,
            { step: 1, type: 'tool_call', toolCall: frontToolcall ?? [], content: str }
          ])
          console.warn('llm')
        }
        else if (frontdata.type === 'answer') {
          setCurrent(3)

          const frontAnswer = frontdata.content
          if (typeof frontAnswer === 'string') {
            setData(frontAnswer)
          }
          setEvents(prev => [
            ...prev,
            {
              step: 3,
              type: 'answer',
              toolCall: frontToolcall ?? [],
              content: '回答已生成，请查看下方回答区域'
            }
          ])

          //展示在summarypanel组件
          console.warn('answer')

        }

        //后端明确通知完成任务
        else if (frontdata.type === 'done') {

          setCurrent(4)
          setEvents(prev => [
            ...prev,
            { step: 4, type: 'done', toolCall: frontToolcall ?? [], content: typeof frontdata.content === 'string' ? frontdata.content : '任务结束' }
          ])
          //这里要展示在另一个组件里
          console.warn('done')

        }
        else if (frontdata.type === 'error') {
          const errorContent = typeof frontdata.content === 'string' ? frontdata.content : 'Agent 执行失败'
          setContent(errorContent)


          setEvents(prev => [
            ...prev,
            //沿用上一段历史记录
            { step: prev.at(-1)?.step ?? 0, type: 'error', toolCall: frontToolcall ?? [], content: errorContent }
          ])
          //这里要展示在另一个组件里
          console.warn('error')

        }
        else {

          console.warn('继续读取下一个\n\n')
          continue
        }
        //没出现分隔符的时候进入下一轮
      }
      //每个流
      console.warn('当前流执行结束')
    }
    console.warn('任务结束')
    //任务结束
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
      setCodeResults([])
      setTextResults([createMessageResult('请输入需要检索的问题')])
      setData('输入关键词后 ai分析给出总结')
      return
    }

    //加载状态
    setEvents([])
    setCurrent(0)
    setContent('')
    setToolCall([])
    setCodeResults([])
    setTextResults([createMessageResult('正在分析中')])
    setData(`正在分析中,关键词${keyword}`)
    //捕获异常
    try {
      console.warn('即将进入agentloop')
      //执行agentloop
      await agentLoop(keyword)
      // await ragSearch('vite是什么', setCodeResults, setTextResults)
      console.warn('agentloop执行完毕')


    }
    catch (error) {
      //主动取消时不显示网络失败提示
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      //这里只识别请求和读取流时添加的标记
      const isNetworkError = error instanceof Error && 'code' in error && error.code === 'NETWORK_ERROR'
      //根据error.code返回前端提示
      const errorMessage = isNetworkError
        ? '网络连接失败或中断，请检查网络或后端服务后重试'
        : error instanceof Error ? error.message : '后端未成功返回搜索结果或 AI 总结，请检查接口状态、返回数据格式，或稍后重试'
      console.error('搜索失败', error)
      setContent(errorMessage)
      setEvents(prev => [
        ...prev,
        {
          step: prev.at(-1)?.step ?? 0,
          type: 'error',
          toolCall: [],
          content: errorMessage
        }
      ])
      setTextResults([createMessageResult('检索失败')])
      setCodeResults([])
      setData(errorMessage)
    }
  }

  return (
    <>
      <SearchForm word={word} onSearch={handleSearch} />
      {/* 选择来源组件 */}
      <Select
        mode="multiple"
        options={selectiOptions}
        onChange={handleSourceChange}
      />
      <Checkbox checked={ismd} onChange={e => setIsmd(e.target.checked)}>
        生成 Markdown 报告
      </Checkbox>
      {ismd && <Radio.Group value={isMap} onChange={e => setIsMap(e.target.value)}>
        <Radio value="true">生成思维导图</Radio>
        <Radio value="false">不生成</Radio>
        <Radio value="auto">自动判断</Radio>
      </Radio.Group>}
      {/* agent流程组件 */}
      <AgentProgress
        current={current}
        events={events}
        content={content}
        toolCall={tooCall}
      ></AgentProgress>
      {/* 显示搜索结果前五条 */}
      <ResultList textResults={textResults} codeResults={codeResults} />

      {/* 显示ai总结文本 */}
      <SummaryPanel data={data} />
    </>
  )

}
export default App
