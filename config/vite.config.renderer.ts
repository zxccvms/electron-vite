import { UserConfig } from 'vite'
import defineGlobalVariable from './scripts/globalVariable'
import { getPath, root } from './utils'
import electron from './plugins/vite-plugin-electron'
import react from '@vitejs/plugin-react'
import inject from './plugins/rollup-plugin-inject'
import copy from 'rollup-plugin-copy'

export default (params: ICommandLineParams) => {
	const { mode, port, bot } = params
	const productName = bot ? 'bot' : 'factory'

	const options: UserConfig = {
		root,
		mode,
		base: './',
		define: defineGlobalVariable(params),
		resolve: {
			alias: {
				src: getPath('./src'),
				resources: getPath('./resources'),
			},
		},
		plugins: [electron(), react(), inject()],
		server: {
			port,
			strictPort: true,
			// open: bot ? "/bot.html" : "/factory.html" // web开发
		},
		build: {
			sourcemap: true,
			emptyOutDir: false,
			minify: mode === 'production' ? 'terser' : false,
			terserOptions:
				mode === 'production'
					? {
							compress: {
								keep_classnames: true,
							},
					  }
					: {},
			outDir: getPath('./dist'),
			rollupOptions: {
				input: {
					window: getPath(`window.html`),
					[productName]: getPath(`${productName}.html`),
					[`${productName}Server`]: getPath(`${productName}Server.html`),
				},
				output: {
					entryFileNames: `[name].${mode}.js`,
					chunkFileNames: `[name].${mode}.js`,
					assetFileNames: `[name].[ext]`,
					format: 'esm',
				},
				external: ['electron'], // 不打包 electron
				plugins: [
					copy({
						verbose: true,
						targets: [
							{
								src: `resources/${productName}`,
								dest: getPath('./dist/resources'),
							},
							{
								src: 'resources/common',
								dest: getPath('./dist/resources'),
							},
						],
					}),
				],
			},
		},
		optimizeDeps: {
			exclude: ['electron'], // 不转换 electron
		},
	}

	return options
}
