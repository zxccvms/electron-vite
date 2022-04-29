import PipelineCallbackCollection from './pipeline/PipelineCallbackCollection'
import { ERpcEvent, EPipelineStage, ERpcType } from './types'

/** rpc客户端 */
class RpcClient {
	/** 响应事件映射表 */
	private responseMap: Map<string, IRpcResponse> = new Map()
	private pipelineCallbackCollectionMap: Map<
		string,
		PipelineCallbackCollection
	> = new Map()

	constructor(
		/** 通信模块 */ private cm: ICommunicationModule<ERpcType.client>
	) {
		this.cm.onMessage(async msgInfo => {
			switch (msgInfo.event) {
				case ERpcEvent.trigger:
					return this.onTrigger(
						msgInfo as IMsgInfo<ERpcType.server, ERpcEvent.trigger>
					)
				case ERpcEvent.dispatch:
					return this.postResponse(
						msgInfo.id,
						await this.onDispatch(
							msgInfo as IMsgInfo<ERpcType.server, ERpcEvent.dispatch>
						)
					)
				case ERpcEvent.response:
					return this.onResponse(
						msgInfo as IMsgInfo<ERpcType.server, ERpcEvent.response>
					)
				default:
					throw `rpc client is not support "${msgInfo.event}" event`
			}
		})
	}

	private onTrigger(msgInfo: IMsgInfo<ERpcType.server, ERpcEvent.trigger>) {
		const { pipelineName, stage, identifier, params = [] } = msgInfo.data

		switch (stage) {
			case EPipelineStage.produce:
			case EPipelineStage.process:
				throw `${pipelineName} pipeline ${stage} stage should use dispatch event`
			case EPipelineStage.subscribe:
			case EPipelineStage.consume: {
				const stageCallback = this.getStageCallback(
					pipelineName,
					stage,
					identifier
				)
				if (!stageCallback)
					throw `"${pipelineName}" pipeline "${stage}" stage "${identifier}" callback is not existed`

				stageCallback(...(params as [any]))
				break
			}
			default:
				throw `pipeline is not support "${stage}" stage`
		}
	}

	private async onDispatch(
		msgInfo: IMsgInfo<ERpcType.server, ERpcEvent.dispatch>
	): Promise<IClientMsgInfoDataMap[ERpcEvent.response]> {
		const { pipelineName, stage, identifier, params = [] } = msgInfo.data

		try {
			switch (stage) {
				case EPipelineStage.subscribe:
				case EPipelineStage.consume:
					throw `"${pipelineName}" pipeline "${stage}" stage should use trigger event`
				case EPipelineStage.produce:
				case EPipelineStage.process: {
					const stageCallback = this.getStageCallback(
						pipelineName,
						stage,
						identifier
					)
					if (!stageCallback)
						throw `"${pipelineName}" pipeline "${stage}" stage "${identifier}" callback is not existed`

					return {
						pipelineName,
						code: 0,
						value: await stageCallback(...(params as [any])),
					}
				}
			}
		} catch (e) {
			console.error(e)
			return {
				pipelineName,
				code: 1,
				value: e.toString(),
			}
		}
	}

	private getStageCallback<T extends EPipelineStage>(
		pipelineName: string,
		stage: T,
		identifier: TStageIdentifier
	): IStageCallbackMap[T] {
		const pipelineCallbackCollection =
			this.pipelineCallbackCollectionMap.get(pipelineName)
		if (!pipelineCallbackCollection)
			throw `"${pipelineName}" pipeline is not existed in the rpcClient's pipelineCallbackCollection`

		return pipelineCallbackCollection.getStageCallback(stage, identifier)
	}

	private onResponse(msgInfo: IMsgInfo<ERpcType.server, ERpcEvent.response>) {
		const { id, data } = msgInfo
		const { pipelineName, code, value } = data
		const response = this.responseMap.get(id)
		if (!response)
			throw `"${pipelineName}" pipeline response event not find callback`

		if (code === 0) response.res(value)
		else response.rej(value)

		if (response.isDestroy) this.responseMap.delete(id)
	}

	/** 发送一个响应事件 */
	private postResponse(
		id: string,
		data: IClientMsgInfoDataMap[ERpcEvent.response]
	) {
		this.cm.postMessage({
			id,
			event: ERpcEvent.response,
			data,
		})
	}

	/** 触发一个pipeline 无返回值 */
	trigger(pipelineName: string, ...params: any[]) {
		this.cm.postMessage({
			id: randomString(10),
			event: ERpcEvent.trigger,
			data: {
				pipelineName,
				params,
			},
		})
	}

	/** 调度一个pipeline 有返回值 */
	async dispatch(pipelineName: string, ...params: any[]) {
		return new Promise((res, rej) => {
			const id = randomString(10)
			this.cm.postMessage({
				id,
				event: ERpcEvent.dispatch,
				data: {
					pipelineName,
					params,
				},
			})

			this.responseMap.set(id, { res, rej, isDestroy: true })
		})
	}

	/** 注册pipeline的stage回调 */
	register(
		pipelineName: string,
		stageCallbackMap: IStageCallbackMap
	): Promise<() => Promise<boolean>> {
		if (!stageCallbackMap)
			throw `register "${pipelineName}" pipeline is lack stageCallbackMap param`

		return new Promise((res, rej) => {
			const id = randomString(10)
			// todo 先生成标识符映射表 再注入到collection
			const stageIdentifierMap = this.handleStageCallbackMap(
				pipelineName,
				stageCallbackMap
			)

			this.cm.postMessage({
				id,
				event: ERpcEvent.register,
				data: {
					pipelineName,
					stageIdentifierMap,
				},
			})

			const destroy = () => this.unregister(pipelineName, stageIdentifierMap)

			this.responseMap.set(id, { res: () => res(destroy), rej })
		})
	}

	private handleStageCallbackMap(
		pipelineName: string,
		stageCallbackMap: IStageCallbackMap
	) {
		const pipelineCallbackCollection =
			this.pipelineCallbackCollectionMap.get(pipelineName) ||
			new PipelineCallbackCollection(pipelineName)

		const stageIdentifierMap: IStageIdentifierMap = {}
		for (const stage of Object.keys(stageCallbackMap) as EPipelineStage[]) {
			const identifier: TStageIdentifier = `RPC_CALLBACK_${randomString(10)}`
			const stageCallback = stageCallbackMap[stage]
			pipelineCallbackCollection.pushStageCallback(
				stage,
				identifier,
				stageCallback
			)

			stageIdentifierMap[stage] = identifier
		}

		this.pipelineCallbackCollectionMap.set(
			pipelineName,
			pipelineCallbackCollection
		)

		return stageIdentifierMap
	}

	/** 卸载pipeline的stage回调 */
	private unregister(
		pipelineName: string,
		stageIdentifierMap: IStageIdentifierMap
	): Promise<boolean> {
		return new Promise(res => {
			const id = randomString(10)
			this.cm.postMessage({
				id,
				event: ERpcEvent.unregister,
				data: {
					pipelineName,
					stageIdentifierMap,
				},
			})

			this.responseMap.set(id, {
				res: () => {
					try {
						this.deletePartialStageCallback(pipelineName, stageIdentifierMap)
						res(true)
					} catch (err) {
						console.error(err)
						res(false)
					}
				},
				rej: err => {
					console.error(err)
					res(false)
				},
				isDestroy: true,
			})
		})
	}

	/** 删除部分pipeline阶段函数 */
	private deletePartialStageCallback(
		pipelineName: string,
		stageIdentifierMap: IStageIdentifierMap
	) {
		const pipelineCallbackCollection =
			this.pipelineCallbackCollectionMap.get(pipelineName)
		if (!pipelineCallbackCollection) return

		pipelineCallbackCollection.popStageCallbackMap(stageIdentifierMap)

		if (pipelineCallbackCollection.shouldDestroy()) {
			pipelineCallbackCollection.destroy()
			this.pipelineCallbackCollectionMap.delete(pipelineName)
		}
	}

	destroy() {
		console.info('rpc client is being destroyed')

		const pipelineIdentifiersMap: {
			[pipelineName: string]: IStageIdentifiersMap
		} = {}
		for (const [pipelineName, pipelineCallbackCollection] of this
			.pipelineCallbackCollectionMap) {
			const stageIdentifiersMap =
				pipelineCallbackCollection.getStageIdentifiersMap()
			pipelineIdentifiersMap[pipelineName] = stageIdentifiersMap

			pipelineCallbackCollection.destroy()
			this.pipelineCallbackCollectionMap.delete(pipelineName)
		}
		this.cm.postMessage({
			id: randomString(10),
			event: ERpcEvent.destroy,
			data: {
				pipelineIdentifiersMap,
			},
		})

		this.cm.destroy()

		this.responseMap = undefined
		this.pipelineCallbackCollectionMap = undefined
		this.cm = undefined
	}
}

export default RpcClient
