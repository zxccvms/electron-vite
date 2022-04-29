class MessagePortModule implements ICommunicationModule {
	private callOnMessageCount = 0
	constructor(private port: MessagePort) {}

	postMessage(msgInfo: IMsgInfo): void {
		console.debug('MessagePort postMessage: ', msgInfo)
		this.port.postMessage(msgInfo)
	}

	onMessage(cb: (msgInfo: IMsgInfo) => void): void {
		if (this.callOnMessageCount !== 0)
			throw 'CommunicationModule onMessage only one call is allowed'

		this.port.onmessage = e => {
			console.debug('MessagePort onMessage: ', e.data)
			cb(e.data)
		}

		this.callOnMessageCount++
	}

	destroy(): void {
		this.port.close()
		this.port = undefined
	}
}

export default MessagePortModule
