/** 广播浏览器通信模块 基于broadcast */
class BroadcastBrowserModule implements ICommunicationModule {
	private _broadcast: BroadcastChannel
	constructor(channelName: string) {
		this._broadcast = new BroadcastChannel(channelName)
	}

	postMessage() {
		this._broadcast.postMessage
	}

	onMessage() {
		this._broadcast.onmessage
	}

	destroy() {
		this._broadcast.close()
	}
}

export default BroadcastBrowserModule
