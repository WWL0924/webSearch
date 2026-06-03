import { Input } from 'antd'

type SearchFormProps = {
  word?: string
  onSearch: (value: string) => void
}

function SearchForm({ word, onSearch }: SearchFormProps) {
  const { Search } = Input

  return (
    <Search
      placeholder="请输入要查询的内容"
      enterButton="搜索"
      defaultValue={word}
      onSearch={onSearch}
      style={{ width: 300 }}
    />
  )
}

export default SearchForm
