import { builtinModules } from 'module'
import { RollupOptions } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import defineGlobalVariable from './scripts/globalVariable'
import inject from './plugins/rollup-plugin-inject'
import { getPath } from './utils'

/** node.js builtins module */
const builtins = () =>
	builtinModules.filter(x => !/^_|^(internal|v8|node-inspect)\/|\//.test(x))

export default (params: ICommandLineParams) => {
	const { mode, bot } = params
	const productName = bot ? 'bot' : 'factory'

	const options: RollupOptions = {
		input: getPath(`./src/${productName}/main/index.ts`),
		output: {
			sourcemap: true,
			file: getPath(`./dist/main.js`),
			format: 'cjs', // 使用 CommonJs 模块化
		},
		plugins: [
			nodeResolve(), // 支持 node_modules 下面的包查找
			commonjs(), // 支持 CommonJs 模块
			json(), // 支持引入 json 文件
			typescript({
				module: 'ESNext', // 支持 typescript
			}),
			replace({
				...defineGlobalVariable(params),
				preventAssignment: true,
			}),
			inject(),
		],
		external: [
			// 打包避开内置模块
			...builtins(),
			'electron',
		],
	}

	return options
}
