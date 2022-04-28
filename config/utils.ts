import cliColor from 'cli-color'
import minimist from 'minimist'
import path from 'path'
import { EMode } from '../src/global.enum'

export const root = path.join(__dirname, '..')
export const getPath = (relativePath: string) => path.join(root, relativePath)

enum ECliColorField {
	main = 'blue',
	renderer = 'green',
	packager = 'cyan',
}

export const printToTerminal = (
	type: 'main' | 'renderer' | 'packager',
	content: string,
	color: 'white' | 'yellow' | 'red' = 'white'
) => {
	if (!content.trim()) return

	const cliColorField = ECliColorField[type]
	const prefix = cliColor[cliColorField](`[${type}]`)
	const outContent = cliColor[color](content)
	console.log(prefix + outContent)
}

/** 得到命令行参数 */
export const getCommandLineParams = (): ICommandLineParams => {
	const {
		mode = EMode.development,
		bot = false,
		port = bot ? 3334 : 3333,
	} = minimist<ICommandLineParams>(process.argv.slice(2))

	return { mode, bot, port }
}
