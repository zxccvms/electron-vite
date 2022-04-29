import { ipcRenderer } from 'electron'
import { RpcServer, MessagePortModule } from 'src/common/base/rpc'

const createPortBtn = document.querySelector('#sendBtn1') as HTMLElement
const createRpcBtn = document.querySelector('#sendBtn2') as HTMLElement
const createPipelineBtn = document.querySelector('#sendBtn3') as HTMLElement
const deletePipelineBtn = document.querySelector('#sendBtn4') as HTMLElement
const runPipelineBtn = document.querySelector('#sendBtn5') as HTMLElement

let port: MessagePort
ipcRenderer.once('send-port', e => {
	port = e.ports[0]
	console.info('get port: ', port)
})

createPortBtn.onclick = () => {
	ipcRenderer.send('create-port')
}

let rpcServer: RpcServer
let destroy: () => boolean
createRpcBtn.onclick = () => {
	const messagePortModule = new MessagePortModule(port)
	rpcServer = new RpcServer(messagePortModule)
	console.log(
		`taozhizhu ~🚀 file: index.ts ~🚀 line 41 ~🚀 rpcServer`,
		rpcServer
	)
}

createPipelineBtn.onclick = () => {
	destroy = rpcServer.register('test', {
		subscribe: (...params) =>
			console.log('test pipeline is running, params: ', params),
		produce: (...params) => params.reduce((res, param) => res + param, ''),
		process: value => value + '赵文',
		consume: value => console.log('test pipeline result: ', value),
	})
}

deletePipelineBtn.onclick = () => {
	destroy()
}

runPipelineBtn.onclick = () => {
	rpcServer.dispatch('test', '5', '2', '0')
}
