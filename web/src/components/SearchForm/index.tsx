import { Input } from 'antd'

type SearchFormProps = {
  word?: string
  onSearch: (value: string) => void | Promise<void>
}

function SearchForm({ word, onSearch }: SearchFormProps) {
  const { Search } = Input

  //收集输入 触发提交
  function handleSearch(value: string) {
    onSearch(value)
  }

  return (
    <Search
      placeholder="请输入要查询的内容"
      enterButton="搜索"
      defaultValue={word}
      onSearch={handleSearch}
      style={{ width: 300 }}
    />
  )
}

export default SearchForm
