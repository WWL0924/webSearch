//改名逻辑
const fs = require('fs') //读写文件的对象
//这里path的格式要是 ./Node/list/ 最后有个/

//path处理
const path = require('path')

function app(fromDir, role, toDir, targetExt) {
  //读取目录 异步写法
  fs.readdir(fromDir, function (err, files) {
    if (err !== null) {
      console.log('读取目录出现错误', err)
    } else {
      console.log('读取的目录', files)

      // 过滤文件后缀
      let filesToProcess = files;
      if (targetExt !== 'all') {
        // 如果用户传入了特定的后缀（比如 'txt'），我们就过滤一下
        // path.extname(file) 会返回 '.txt'，所以我们需要把前面的 '.' 去掉再比较
        filesToProcess = files.filter(file => {
          const ext = path.extname(file).slice(1);
          return ext === targetExt; //返回后缀相同的元素
        });
      }

      console.log(`即将处理的文件 (${filesToProcess.length} 个):`, filesToProcess);

      if (filesToProcess.length === 0) {
        console.log('没有找到匹配的文件，流程结束。');
        return;
      }

      //执行改名流程 
      filesToProcess.forEach((item, index) => {
        fs.rename(path.join(fromDir, item), name(item, index, role, toDir), function (err) {
          if (err !== null) {
            console.log('批量改名出现错误', err)
          } else {
            console.log('改名成功')
          }
        })
      })
    }
  })
}
//批量命名规则
//这里想根据role不同更改不同的名字
const name = (fileName, index, role, toDir) => {
  let [name, type] = fileName.split('.');

  let newName;
  try {
    // eval 会寻找当前作用域下的 name 和 index 变量
    // 例如 role 是 "name[0]"，结果就是文件名的首字母
    // 例如 role 是 "name == 'a' ? 'aa' : 'bb'"，结果就是三元运算结果
    console.log('--- eval 即将执行的内容:', role);
    newName = eval(role);//这里index也会自动计算么

  } catch (e) {
    console.log('表达式解析错误:', e.message);
    newName = name; // 出错则保留原名
  }

  return path.join(toDir, newName + '.' + type);
}

//导出
module.exports = app