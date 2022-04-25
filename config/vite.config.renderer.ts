import { UserConfig } from 'vite'
import electron from './plugins/vite-plugin-electron'
import react from '@vitejs/plugin-react'
import globalVariableMap from './scripts/globalVariable'
import copyAsset from './plugins/rollup-copy-asset'
import { getPath, root } from './utils'

export default (params: ICommandLineParams) => {
	const { mode, port, bot } = params

	const options: UserConfig = {
		root,
		mode,
		define: globalVariableMap(params),
		resolve: {
			alias: {
				src: getPath('./src'),
				resources: getPath('./resources'),
			},
		},
		plugins: [electron(), react()],
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
					factory: getPath('./src/factory/renderer/index.ts'),
					factoryServer: getPath('./src/factory/server/index.ts'),
				},
				output: {
					entryFileNames: `[name].${mode}.js`,
					chunkFileNames: `[name].${mode}.js`,
					assetFileNames: `[name].[ext]`,
					format: 'cjs',
				},
				external: ['electron'], // 不打包 electron
				plugins: [copyAsset(params)],
			},
		},
		optimizeDeps: {
			exclude: ['electron'], // 不转换 electron
		},
	}

	return options
}
