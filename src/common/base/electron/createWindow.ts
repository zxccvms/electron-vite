import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { mergeDeepRight } from 'ramda'

interface ICreateOptions {
	src: string
	wOptions?: Partial<BrowserWindowConstructorOptions>
}

interface ICreateWindow {
	(options: ICreateOptions): BrowserWindow
}

const createWindow: ICreateWindow = ({ src, wOptions = {} }) => {
	const win = new BrowserWindow(
		mergeDeepRight(
			{
				width: 0,
				height: 0,
			},
			wOptions
		)
	)

	const isUrl = src.startsWith('http')

	if (isUrl) win.loadURL(src)
	else win.loadFile(src)

	if (MODE === 'development') {
		win.webContents.openDevTools({ mode: 'detach' })
	}

	return win
}

export default createWindow
