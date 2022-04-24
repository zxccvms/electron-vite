import * as rollup from 'rollup'
import minimist from 'minimist'
import getMainOptions from '../rollup.config.main'

// 解析 npm script 的命令行参数
const {
	mode = EMode.development,
	bot = false,
	port = bot ? 3334 : 3333,
} = minimist<ICommandLineParams>(process.argv.slice(2))

// /** 构建主进程文件 */
async function buildMain() {
	const options = getMainOptions({ mode, bot, port })
	const outOptions = options.output as rollup.OutputOptions
	const builder = await rollup.rollup(options)
	await builder.write(outOptions)
}

buildMain()
