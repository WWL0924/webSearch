//搜索框
import { useState } from 'react'
import { Input } from 'antd';
import './App.css'
import type Search from 'antd/es/transfer/search';

function SearchForm() {
  //查询过程中显示 查询中
  function onSearch(value) {
    //获取输入框中的内容
    console.log(value)

    //调用后端开始分析

    //loading状态


  }

  const { Search } = Input;
  return (
    <>
      <Search
        placeholder='请输入要查询的内容'
        enterButton="搜索"
        onSearch={onSearch}
        style={{ width: 300 }}
      />
    </>
  )
}

export default SearchForm
