import { app } from 'electron'
import createWindow from 'src/common/base/electron/createWindow'

app.whenReady().then(() => {
	createWindow({
		src: app.isPackaged
			? './dist/factoryServer.html'
			: 'http://localhost:3333/factoryServer.html',
		wOptions: {
			show: false,
		},
	})

	createWindow({
		src: app.isPackaged
			? './dist/factory.html'
			: 'http://localhost:3333/factory.html',
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
