import Pipeline from './pipeline/Pipeline'
import PipelineManager from './pipeline/PipelineManager'
import PipelineCallbackCollection from './pipeline/PipelineCallbackCollection'
import { ERpcEvent, EPipelineStage, ERpcType } from './types'

/** rpc服务端 */
class RpcServer {
	/** 响应事件映射表 */
	private responseMap: Map<string, IRpcResponse> = new Map()
	private pipelineCallbackCollectionMap: Map<
		string,
		PipelineCallbackCollection
	> = new Map()

	constructor(
		/** 通信模块 */ private cm: ICommunicationModule<ERpcType.server>,
		private pipelineManager = new PipelineManager()
	) {
		this.cm.onMessage(async msgInfo => {
			switch (msgInfo.event) {
				case ERpcEvent.trigger:
					return this.onTrigger(
						msgInfo as IMsgInfo<ERpcType.client, ERpcEvent.trigger>
					)
				case ERpcEvent.dispatch:
					return this.portResponse(
						msgInfo.id,
						await this.onDispatch(
							msgInfo as IMsgInfo<ERpcType.client, ERpcEvent.dispatch>
						)
					)
				case ERpcEvent.response:
					return this.onResponse(
						msgInfo as IMsgInfo<ERpcType.client, ERpcEvent.response>
					)
				case ERpcEvent.register:
					return this.portResponse(
						msgInfo.id,
						this.onRegister(
							msgInfo as IMsgInfo<ERpcType.client, ERpcEvent.register>
						)
					)
				case ERpcEvent.unregister:
					return this.portResponse(
						msgInfo.id,
						this.onUnregister(
							msgInfo as IMsgInfo<ERpcType.client, ERpcEvent.unregister>
						)
					)
				case ERpcEvent.destroy:
					return this.onDestroy(
						msgInfo as IMsgInfo<ERpcType.client, ERpcEvent.destroy>
					)
				default:
					throw `rpc server is not support "${msgInfo.event}" event`
			}
		})
	}

	/** 监听触发事件 */
	private onTrigger(msgInfo: IMsgInfo<ERpcType.client, ERpcEvent.trigger>) {
		const { pipelineName, params = [] } = msgInfo.data

		this.trigger(pipelineName, ...params)
	}

	/** 监听调度事件 */
	private async onDispatch(
		msgInfo: IMsgInfo<ERpcType.client, ERpcEvent.dispatch>
	): Promise<IServerMsgInfoDataMap[ERpcEvent.response]> {
		const { pipelineName, params = [] } = msgInfo.data

		try {
			const value = await this.dispatch(pipelineName, ...params)
			return { pipelineName, code: 0, value }
		} catch (e) {
			console.error(e)
			return { pipelineName, code: 1, value: e.toString() }
		}
	}

	/** 监听响应事件 */
	private onResponse(msgInfo: IMsgInfo<ERpcType.client, ERpcEvent.response>) {
		const { id, data } = msgInfo
		const { pipelineName, code, value } = data
		const response = this.responseMap.get(id)
		if (!response)
			throw `"${pipelineName}" pipeline response event not find callback`

		if (code === 0) response.res(value)
		else response.rej(value)

		if (response.isDestroy) this.responseMap.delete(id)
	}

	/** 监听注册事件 */
	private onRegister(
		msgInfo: IMsgInfo<ERpcType.client, ERpcEvent.register>
	): IServerMsgInfoDataMap[ERpcEvent.response] {
		const { pipelineName, stageIdentifierMap } = msgInfo.data

		try {
			const stageCallbackMap = this.handleStageIdentifierMap(
				pipelineName,
				stageIdentifierMap
			)
			this.register(pipelineName, stageCallbackMap)

			return { pipelineName, code: 0, value: '注册成功' }
		} catch (e) {
			console.error(e)
			return { pipelineName, code: 1, value: e.toString() }
		}
	}

	private handleStageIdentifierMap(
		pipelineName: string,
		stageIdentifierMap: IStageIdentifierMap
	): IStageCallbackMap {
		const pipelineCallbackCollection =
			this.pipelineCallbackCollectionMap.get(pipelineName) ||
			new PipelineCallbackCollection(pipelineName)

		const stageCallbackMap: IStageCallbackMap = {}
		for (const [stage, identifier] of Object.entries(stageIdentifierMap) as [
			EPipelineStage,
			TStageIdentifier
		][]) {
			const stageCallback = pipelineCallbackCollection.getStageCallback(
				stage,
				identifier
			)
			if (stageCallback) {
				stageCallbackMap[stage] = stageCallback
			} else {
				switch (stage) {
					case EPipelineStage.produce:
					case EPipelineStage.process: {
						stageCallbackMap[stage] = (...params) =>
							this.postDispatch({ pipelineName, stage, identifier, params })
						break
					}
					case EPipelineStage.subscribe:
					case EPipelineStage.consume: {
						stageCallbackMap[stage] = (...params) =>
							this.postTrigger({ pipelineName, stage, identifier, params })
						break
					}
					default: {
						console.warn(
							`"${pipelineName}" pipeline is not support "${stage}" stage`
						)
						continue
					}
				}
			}
			pipelineCallbackCollection.pushStageCallback(
				stage,
				identifier,
				stageCallbackMap[stage]
			)
		}

		this.pipelineCallbackCollectionMap.set(
			pipelineName,
			pipelineCallbackCollection
		)
		return stageCallbackMap
	}

	/** 监听注销事件 */
	private onUnregister(
		msgInfo: IMsgInfo<ERpcType.client, ERpcEvent.unregister>
	): IServerMsgInfoDataMap[ERpcEvent.response] {
		const { pipelineName, stageIdentifierMap } = msgInfo.data
		try {
			this.unregisterPipeline(pipelineName, {
				stageIdentifierMap,
			})
			return {
				pipelineName,
				code: 0,
				value: '注销成功',
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

	/** 监听销毁事件 */
	private onDestroy(msgInfo: IMsgInfo<ERpcType.client, ERpcEvent.destroy>) {
		const { pipelineIdentifiersMap } = msgInfo.data

		for (const [pipelineName, stageIdentifiersMap] of Object.entries(
			pipelineIdentifiersMap
		)) {
			try {
				this.unregisterPipeline(pipelineName, {
					stageIdentifiersMap,
				})
			} catch (err) {
				console.error(
					`"${pipelineName}" pipeline is not unregistered in the rpcServer err: `,
					err
				)
			}
		}
	}

	/** 注销 pipeline 和 pipelineCallbackCollection 的回调集合*/
	private unregisterPipeline(
		pipelineName: string,
		{
			stageIdentifierMap,
			stageIdentifiersMap,
		}: {
			stageIdentifierMap?: IStageIdentifierMap
			stageIdentifiersMap?: IStageIdentifiersMap
		}
	) {
		if (!stageIdentifierMap && !stageIdentifiersMap)
			throw `unregister "${pipelineName}" pipeline is lack stageIdentifierMap or stageIdentifiersMap params`

		const { pipeline, pipelineCallbackCollection } =
			this.getPipeline(pipelineName)

		if (stageIdentifierMap) {
			const stageCallbackMap =
				pipelineCallbackCollection.popStageCallbackMap(stageIdentifierMap)

			pipeline.unregister(stageCallbackMap)
		} else if (stageIdentifiersMap) {
			const stageCallbacksMap =
				pipelineCallbackCollection.popStageCallbacksMap(stageIdentifiersMap)

			pipeline.unregisterByStageCallbacksMap(stageCallbacksMap)
		}

		if (pipelineCallbackCollection.shouldDestroy()) {
			pipelineCallbackCollection.destroy()
			this.pipelineCallbackCollectionMap.delete(pipelineName)
		}
		if (pipeline.shouldDestroy()) {
			pipeline.destroy()
			this.pipelineManager.delete(pipelineName)
		}
	}

	/** 得到一个 pipeline 和 pipelineCallbackCollection */
	private getPipeline(pipelineName: string) {
		const pipeline = this.pipelineManager.select(pipelineName)
		if (!pipeline)
			throw `"${pipelineName}" pipeline is not existed in the rpcServer's pipelineManager`

		const pipelineCallbackCollection =
			this.pipelineCallbackCollectionMap.get(pipelineName)
		if (!pipelineCallbackCollection)
			throw `"${pipelineName}" pipeline is not existed in the rpcServer's pipelineCallbackCollection`

		return { pipeline, pipelineCallbackCollection }
	}

	/** 发送一个响应事件 */
	private portResponse(
		id: string,
		data: IServerMsgInfoDataMap[ERpcEvent.response]
	) {
		this.cm.postMessage({
			id,
			event: ERpcEvent.response,
			data,
		})
	}

	/** 发送一个触发事件 */
	private postTrigger(data: IServerMsgInfoDataMap[ERpcEvent.trigger]) {
		this.cm.postMessage({
			id: randomString(10),
			event: ERpcEvent.trigger,
			data,
		})
	}

	/** 发送一个调度事件 */
	private async postDispatch(data: IServerMsgInfoDataMap[ERpcEvent.dispatch]) {
		return new Promise((res, rej) => {
			const id = randomString(10)
			this.cm.postMessage({
				id,
				event: ERpcEvent.dispatch,
				data,
			})

			this.responseMap.set(id, { res, rej, isDestroy: true })
		})
	}

	/** 注册一个pipeline */
	register(
		pipelineName: string,
		stageCallbackMap: IStageCallbackMap
	): () => boolean {
		if (!stageCallbackMap)
			throw `register "${pipelineName}" pipeline is lack stageCallbackMap param`

		let pipeline = this.pipelineManager.select(pipelineName)
		if (pipeline) {
			pipeline.register(stageCallbackMap)
		} else {
			pipeline = new Pipeline(pipelineName, stageCallbackMap)
			this.pipelineManager.insert(pipeline)
		}

		const destroy = () => {
			try {
				pipeline.unregister(stageCallbackMap)
				if (pipeline.shouldDestroy()) {
					pipeline.destroy()
					this.pipelineManager.delete(pipelineName)
				}
				return true
			} catch (err) {
				console.error(err)
				return false
			}
		}

		return destroy
	}

	/** 触发一个pipeline 无返回值 */
	trigger(pipelineName: string, ...params: any[]) {
		const pipeline = this.pipelineManager.select(pipelineName)
		if (!pipeline)
			throw `"${pipelineName}" pipeline is not existed in the rpcServer's pipelineManager`

		pipeline.start(...params)
	}

	/** 调度一个pipeline 有返回值 */
	async dispatch(pipelineName: string, ...params: any[]) {
		const pipeline = this.pipelineManager.select(pipelineName)
		if (!pipeline)
			throw `"${pipelineName}" pipeline is not existed in the rpcServer's pipelineManager`

		return await pipeline.start(...params)
	}
}

export default RpcServer
