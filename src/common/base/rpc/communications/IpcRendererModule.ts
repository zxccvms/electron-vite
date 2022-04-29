import { ipcRenderer } from 'electron'

class IpcMainModule implements ICommunicationModule {
	private _channelName: string

	constructor(channelName: string) {
		this._channelName = channelName
	}

	postMessage(message: any): void {
		ipcRenderer.postMessage(this._channelName, message)
	}

	onMessage(): void {
		ipcRenderer.on
	}

	destroy(): void {
		ipcRenderer.invoke
	}
}

export default IpcMainModule
