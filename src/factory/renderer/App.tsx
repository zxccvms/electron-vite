import ReactDOM from 'react-dom/client'

import classMap from './app.module.less'

import { ipcRenderer } from 'electron'
import { MessagePortModule, RpcClient } from 'src/common/base/rpc'

const bc = new BroadcastChannel('test')

bc.onmessage = e => {
	console.log(new Date().getTime())
}

let port: MessagePort
ipcRenderer.once('send-port', e => {
	port = e.ports[0]
	console.info('get port: ', port)
})

interface IProps {}

let rpcClient: RpcClient
let destroy: () => Promise<boolean>
const App: React.FC<IProps> = props => {
	return (
		<div className={classMap.test}>
			<img src={'./resources/factory/1.png'} />
			<button
				onClick={() => {
					const messagePortModule = new MessagePortModule(port)
					rpcClient = new RpcClient(messagePortModule)
					console.log(
						`taozhizhu ~🚀 file: App.tsx ~🚀 line 30 ~🚀 rpcClient`,
						rpcClient
					)
				}}
			>
				生成rpcClient
			</button>
			<button
				onClick={async () => {
					destroy = await rpcClient.register('test', {
						subscribe: (...params) =>
							console.log('test pipeline is running params: ', params),
						process: value => '陈检城' + value,
						consume: value => console.log('test pipeline result: ', value),
					})
				}}
			>
				注册pipeline
			</button>
			<button
				onClick={() => {
					destroy().then(res => console.log('destroy result: ', res))
				}}
			>
				注销pipeline
			</button>
			<button
				onClick={() => {
					rpcClient.trigger('test', '1', '2')
				}}
			>
				trigger
			</button>
			<button
				onClick={() => {
					rpcClient.dispatch('test', '1', '2').then(res => {
						console.log(res)
					})
				}}
			>
				dispatch
			</button>
		</div>
	)
}

ReactDOM.createRoot(document.querySelector('#root')).render(<App />)
