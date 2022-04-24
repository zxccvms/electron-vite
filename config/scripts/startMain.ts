// import path from "path"
// import { get } from "http"
// import { spawn, ChildProcess } from "child_process"
// import { watch } from "rollup"
// import minimist from "minimist"
// import electron from "electron"
// import options from "../rollup.config.main"

// const root = path.join(__dirname, "../..")
// const getPath = (relativePath: string) => path.join(root, relativePath)

// interface IArgs {
//   mode: EMode
// }

// // 解析 npm script 的命令行参数
// const { mode } = minimist<IArgs>(process.argv.slice(2))

// /**
//  * 1. 监听 vite 启动
//  */
// function waitOn(arg0: { port: string | number; interval?: number }) {
//   return new Promise(resolve => {
//     const { port, interval = 149 } = arg0
//     const url = `http://localhost:${port}`

//     // 通过定时器轮训向 Vite 服务器请求
//     const timer: NodeJS.Timer = setInterval(() => {
//       get(
//         url, // 指向 Vite 开发服务器
//         res => {
//           clearInterval(timer)
//           resolve(res.statusCode)
//         }
//       )
//     }, interval)
//   })
// }

// /**
//  * 2. 控制 Electron 启动时机，编译 typescript
//  */
// waitOn({ port: "3333" }).then(msg => {
//   // 加载 rollup 配置
//   const opts = options({ mode })

//   // Vite 启动后以监听模式开启 Rollup 编译 Electron 主进程代码
//   const watcher = watch(opts)

//   let child: ChildProcess

//   watcher.on("event", ev => {
//     if (ev.code === "ERROR") {
//       console.error("building err:", ev)
//     } else if (ev.code === "END") {
//       // 保证只启动一个 Electron 个程序
//       if (child) child.kill()

//       // 使用 NodeJs 子进程能力拉起 Electron 程序
//       child = spawn(
//         // 这里 electron 本质上只是一个字符串；指向 Electron 可执行程序的绝对路径
//         electron as any,

//         // 指定 Electron 主进程入口文件；既 Rollup 编译后输出文件的路径
//         [getPath(`./dist/factoryMain.${mode}.js`)],
//         { stdio: "inherit" }
//       )
//     }
//   })
// })
