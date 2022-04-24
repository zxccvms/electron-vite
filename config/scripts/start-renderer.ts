import minimist from 'minimist'
import getRendererOptions from '../vite.config.renderer'
import * as vite from 'vite'

// 解析 npm script 的命令行参数
const {
	mode = EMode.development,
	bot = false,
	port = bot ? 3334 : 3333,
} = minimist<ICommandLineParams>(process.argv.slice(2))

/** 启动渲染进程 */
async function startRenderer() {
	const options = getRendererOptions({ mode, bot, port })
	const server = await vite.createServer(options)
	await server.listen()
	server.printUrls()
}

startRenderer()
