import { spawn, ChildProcess } from 'child_process'
import { watch } from 'rollup'
import electron from 'electron'
import getMainOptions from '../rollup.config.main'
import { getPath, printToTerminal } from '../utils'
import getRendererOptions from '../vite.config.renderer'
import * as vite from 'vite'
import * as rollup from 'rollup'

/** 启动渲染进程 */
export async function startRenderer(commandLineParams: ICommandLineParams) {
	const options = getRendererOptions(commandLineParams)
	const server = await vite.createServer(options)
	await server.listen()
	server.printUrls()
}

/** 启动主进程 */
export async function startMain(commandLineParams: ICommandLineParams) {
	// 关闭electron安全警告
	process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
	const options = getMainOptions(commandLineParams)
	const watcher = watch(options)

	let child: ChildProcess
	watcher.on('event', ev => {
		if (ev.code === 'ERROR') {
			printToTerminal('main', ev.toString(), 'red')
		} else if (ev.code === 'END') {
			if (child) child.kill()

			child = spawn(
				electron as any, // 这里 electron 本质上只是一个字符串；指向 Electron 可执行程序的绝对路径
				[getPath(`./dist/main.js`)]
			)

			child.stdout.on('data', data => printToTerminal('main', data.toString()))
			child.stderr.on('data', err =>
				printToTerminal('main', err.toString(), 'red')
			)
		}
	})
}

/** 构建主进程文件 */
export async function buildMain(commandLineParams: ICommandLineParams) {
	const options = getMainOptions(commandLineParams)
	const outOptions = options.output as rollup.OutputOptions
	const builder = await rollup.rollup(options)
	await builder.write(outOptions)
}

/** 构建渲染进程文件 */
export async function buildRenderer(commandLineParams: ICommandLineParams) {
	const options = getRendererOptions(commandLineParams)
	await vite.build(options)
}
