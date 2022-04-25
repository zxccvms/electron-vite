import { app } from 'electron'
import createWindow from 'src/common/base/electron/createWindow'

app.whenReady().then(() => {
	createWindow({
		src: app.isPackaged
			? './dist/botServer.html'
			: 'http://localhost:3334/botServer.html',
		wOptions: {
			show: false,
		},
	})

	createWindow({
		src: app.isPackaged ? './dist/bot.html' : 'http://localhost:3334/bot.html',
		wOptions: {
			width: 800,
			height: 800,
		},
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
