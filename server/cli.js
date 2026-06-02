#!/usr/bin/env node
//用node运行
//接受命令参数
const path = require('path')
const rename = require('./app.js')
const fs = require('fs') //读写文件的对象
const readline = require('readline') // 引入 readline 模块实现交互式问答

// 打印帮助信息 (通过 -h 或 --help 触发)
if (process.argv.includes('-h') || process.argv.includes('--help')) {
  console.log(`
用法: fp <源目录> [目标目录] [规则]
参数说明:
  源目录: 必填，待处理文件所在的文件夹
  目标目录: 可选，默认为源目录，传入不同路径则执行移动
  规则:  可选，默认为 "name"，支持 JS 表达式
  目标后缀: 可选，默认为 "all"，输入 all 表示全部处理
  `);
  process.exit(0);
}

// 创建交互接口
const rl = readline.createInterface({
  input: process.stdin, //监听终端输入
  output: process.stdout //在终端打印文字
});

// 封装成 Promise 以支持 async/await 顺序提问
const askQuestion = (query) => {
  return new Promise(resolve => rl.question(query, resolve));
  //用户提交之后 状态变为fulfilled
};

async function main() {
  // 尝试从命令行读取参数
  let fromDir = process.argv[2];
  let toDir = process.argv[3];
  let role = process.argv[4];
  let targetExt = process.argv[5];

  // 1. 如果命令行没传源目录，则分段询问
  if (!fromDir) {
    fromDir = await askQuestion('请输入源目录 (例如 ./list): ');
    if (!fromDir) {
      console.log('错误：必须输入源目录！');
      process.exit(1);
    }
  }

  // 2. 如果没传目标目录，询问
  if (!toDir) {
    toDir = await askQuestion(`请输入目标目录 (默认与源目录相同: ${fromDir}): `);
    if (!toDir) toDir = fromDir; // 没输入则使用默认值
  }

  // 3. 如果没传规则，询问
  if (!role) {
    role = await askQuestion('请输入命名规则 (默认不改名, 填入 "name"): ');
    if (!role) role = "name"; // 没输入则使用默认值
  }

  // 4. 如果没传目标后缀，询问
  if (!targetExt) {
    targetExt = await askQuestion('请输入要处理的文件后缀 (输入 all 表示全部处理): ');
    if (!targetExt) targetExt = "all"; // 没输入则使用默认值
  }

  rl.close(); // 结束交互

  // 地址校验
  function validate(dir, name) {
    if (!fs.existsSync(dir)) {
      console.log(`${name} ${dir} 不存在`)
      process.exit(1)
    }
    const stats = fs.statSync(dir);
    if (!stats.isDirectory()) {
      console.log(`${name} 必须是一个文件夹`);
      process.exit(1);
    }
  }

  // 分别校验旧地址和新地址
  validate(fromDir, '旧地址');
  validate(toDir, '新地址');

  // console.log('----执行信息----')
  // console.log('源目录:', fromDir)
  // console.log('目标目录:', toDir)
  // console.log('命名规则:', role)
  // console.log('目标后缀:', targetExt)
  // console.log('----------------')

  rename(fromDir, role, toDir, targetExt)
}

// 启动主函数
main();
