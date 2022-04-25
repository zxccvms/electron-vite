import _copy from 'rollup-plugin-copy'
import path from 'path'

const root = path.join(__dirname, '../..')
const getPath = (relativePath: string) => path.join(root, relativePath)

const copy = ({ mode, bot }: ICommandLineParams) => {
	const projectName = bot ? 'bot' : 'factory'

	return _copy({
		verbose: true,
		targets: [
			{
				src: `window.html`,
				dest: getPath('./dist'),
				transform: contentBuffer => {
					const content = contentBuffer.toString()
					return content
						.replace(/<head>((.|\s)*)<\/head>/m, (_, headContent) => {
							return `<head>${headContent}
		<link rel="stylesheet" href="./window.css" />
	</head>`
						})
						.replace(`./src/common/windows/index.ts`, `./window.${mode}.js`)
				},
			},
			{
				src: `${projectName}.html`,
				dest: getPath('./dist'),
				transform: contentBuffer => {
					const content = contentBuffer.toString()
					return content
						.replace(/<head>((.|\s)*)<\/head>/m, (_, headContent) => {
							return `<head>${headContent}
		<link rel="stylesheet" href="./${projectName}.css" />
	</head>`
						})
						.replace(
							`./src/${projectName}/renderer/index.ts`,
							`./${projectName}.${mode}.js`
						)
				},
			},
			{
				src: `${projectName}Server.html`,
				dest: getPath('./dist'),
				transform: contentBuffer => {
					const content = contentBuffer.toString()
					return content.replace(
						`./src/${projectName}/server/index.ts`,
						`./${projectName}Server.${mode}.js`
					)
				},
			},
			{
				src: `resources/${projectName}`,
				dest: getPath('./dist/resources'),
			},
			{
				src: 'resources/common',
				dest: getPath('./dist/resources'),
			},
		],
	})
}

export default copy
