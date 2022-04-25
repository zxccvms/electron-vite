import { builtinModules } from 'module'
import { RollupOptions } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import getGlobalVariable from './scripts/globalVariable'
import { getPath } from './utils'

/** node.js builtins module */
const builtins = () =>
	builtinModules.filter(x => !/^_|^(internal|v8|node-inspect)\/|\//.test(x))

export default (params: ICommandLineParams) => {
	const { mode, bot } = params
	const options: RollupOptions = {
		input: bot
			? getPath('./src/bot/main/index.ts')
			: getPath('./src/factory/main/index.ts'),
		output: {
			file: bot
				? getPath(`./dist/botMain.${mode}.js`)
				: getPath(`./dist/factoryMain.${mode}.js`),
			format: 'cjs', // 使用 CommonJs 模块化
			sourcemap: true,
		},
		plugins: [
			nodeResolve(), // 支持 node_modules 下面的包查找
			commonjs(), // 支持 CommonJs 模块
			json(), // 支持引入 json 文件
			typescript({
				module: 'ESNext', // 支持 typescript
			}),
			replace({
				...getGlobalVariable(params),
				preventAssignment: true,
			}),
		],
		external: [
			// 打包避开内置模块
			...builtins(),
			'electron',
		],
	}

	return options
}
