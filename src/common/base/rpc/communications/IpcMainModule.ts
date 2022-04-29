import { ipcMain } from 'electron'

class IpcMainModule implements ICommunicationModule {
	postMessage(message: any): void {
		ipcMain.handle
	}

	onMessage(): void {
		ipcMain.on
	}

	destroy(): void {
		ipcMain.off
	}
}

export default IpcMainModule
