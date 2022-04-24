import { spawn, ChildProcess } from 'child_process'
import { watch } from 'rollup'
import minimist from 'minimist'
import electron from 'electron'
import getMainOptions from '../rollup.config.main'
import { getPath, printToTerminal } from '../utils'

// 解析 npm script 的命令行参数
const {
	mode = EMode.development,
	bot = false,
	port = bot ? 3334 : 3333,
} = minimist<ICommandLineParams>(process.argv.slice(2))

/** 启动主进程 */
async function startMain() {
	const options = getMainOptions({ mode, bot, port })
	const watcher = watch(options)

	const mainEntryFile = bot
		? getPath(`./dist/botMain.${mode}.js`)
		: getPath(`./dist/factoryMain.${mode}.js`)

	let child: ChildProcess
	watcher.on('event', ev => {
		if (ev.code === 'ERROR') {
			printToTerminal('main', ev.toString(), 'red')
		} else if (ev.code === 'END') {
			if (child) child.kill()

			child = spawn(
				electron as any, // 这里 electron 本质上只是一个字符串；指向 Electron 可执行程序的绝对路径
				[mainEntryFile]
			)

			child.stdout.on('data', data => printToTerminal('main', data.toString()))
			child.stderr.on('data', err =>
				printToTerminal('main', err.toString(), 'red')
			)
		}
	})
}

startMain()
