import { app, ipcMain, MessageChannelMain } from 'electron'
import createWindow from 'src/common/base/electron/createWindow'

app.whenReady().then(() => {
	const serverWin = createWindow({
		src: app.isPackaged
			? './dist/factoryServer.html'
			: 'http://localhost:3333/factoryServer.html',
		wOptions: {
			// show: false,
			width: 800,
			height: 800,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true,
			},
		},
	})

	// createWindow({
	// 	src: app.isPackaged
	// 		? './dist/window.html'
	// 		: `http://localhost:3333/window.html`,
	// 	wOptions: {
	// 		width: 800,
	// 		height: 800,
	// 	},
	// })

	const mainWindow = createWindow({
		src: app.isPackaged
			? './dist/factory.html'
			: 'http://localhost:3333/factory.html',
		wOptions: {
			width: 800,
			height: 800,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true,
			},
		},
	})

	ipcMain.on('create-port', () => {
		const { port1, port2 } = new MessageChannelMain()
		serverWin.webContents.postMessage('send-port', null, [port1])
		mainWindow.webContents.postMessage('send-port', null, [port2])
	})

	mainWindow.on('closed', () => {
		app.quit()
	})
})
