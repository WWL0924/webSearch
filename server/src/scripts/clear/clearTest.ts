//删除测试存入的内容
//这里是脚本,不需要导出

import { getCollection } from '../../services/rag/chromaClient.js'



async function clearTest() {
  const collection = await getCollection()
  const res = await collection.get(
    {
      where:
        { source: 'server\\data\\docs\\test' }
    })
  await collection.delete({
    ids: res.ids
  })
}

clearTest().catch(console.error)
