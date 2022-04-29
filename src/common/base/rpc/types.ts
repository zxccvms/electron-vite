/** rpc类型 */
export enum ERpcType {
	/** 客户端 */
	client = 'client',
	/** 服务端 */
	server = 'server',
}

/** rpc事件名 */
export enum ERpcEvent {
	/** 触发事件 */
	trigger = 'trigger',
	/** 调度事件 */
	dispatch = 'dispatch',
	/** 相应事件 */
	response = 'response',
	/** 注册事件 */
	register = 'register',
	/** 卸载事件 */
	unregister = 'unregister',
	/** 销毁事件 */
	destroy = 'destroy',
}

/** pipeline阶段枚举 */
export enum EPipelineStage {
	/** 订阅阶段 */
	subscribe = 'subscribe',
	/** 生产阶段 */
	produce = 'produce',
	/** 处理阶段 */
	process = 'process',
	/** 消费阶段 */
	consume = 'consume',
}

declare global {
	/** 客户端发送的事件数据映射表 */
	interface IClientMsgInfoDataMap {
		[ERpcEvent.trigger]: {
			pipelineName: string
			params: any[]
		}
		[ERpcEvent.dispatch]: {
			pipelineName: string
			params: any[]
		}
		[ERpcEvent.response]: {
			pipelineName: string
			code: number
			value: any
		}
		[ERpcEvent.register]: {
			pipelineName: string
			stageIdentifierMap: IStageIdentifierMap
		}
		[ERpcEvent.unregister]: {
			pipelineName: string
			stageIdentifierMap: IStageIdentifierMap
		}
		[ERpcEvent.destroy]: {
			pipelineIdentifiersMap: {
				[pipelineName: string]: IStageIdentifiersMap
			}
		}
	}

	/** 服务端发送的事件数据映射表 */
	interface IServerMsgInfoDataMap {
		[ERpcEvent.trigger]: {
			pipelineName: string
			stage: EPipelineStage
			identifier: TStageIdentifier
			params: any[]
		}
		[ERpcEvent.dispatch]: {
			pipelineName: string
			stage: EPipelineStage
			identifier: TStageIdentifier
			params: any[]
		}
		[ERpcEvent.response]: {
			pipelineName: string
			code: number
			value: any
		}
		[ERpcEvent.register]: never
		[ERpcEvent.unregister]: {
			pipelineName: string
			stageIdentifierMap: IStageIdentifierMap
		}
		[ERpcEvent.destroy]: never
	}

	interface IMsgInfo<
		P extends ERpcType = ERpcType,
		T extends ERpcEvent = ERpcEvent
	> {
		id: string
		event: T
		data: P extends ERpcType.server
			? IServerMsgInfoDataMap[T]
			: IClientMsgInfoDataMap[T]
	}

	/** 通信模块 */
	interface ICommunicationModule<T extends ERpcType = ERpcType> {
		postMessage(msgInfo: IMsgInfo<T>): void
		onMessage(
			cb: (
				msgInfo: IMsgInfo<
					T extends ERpcType.client ? ERpcType.server : ERpcType.client
				>
			) => void
		): void
		destroy(): void
	}

	/** pipeline的回调集合 */
	interface IPipelineCallbackCollection {
		/** 订阅的回调集合 */
		[EPipelineStage.subscribe]?: {
			[
				identifier: TStageIdentifier
			]: IStageCallbackMap[EPipelineStage.subscribe]
		}
		/** 生产的回调集合 */
		[EPipelineStage.produce]?: {
			identifier: TStageIdentifier
			callback: IStageCallbackMap[EPipelineStage.produce]
		}
		/** 处理的回调集合 */
		[EPipelineStage.process]?: {
			[identifier: TStageIdentifier]: IStageCallbackMap[EPipelineStage.process]
		}
		/** 消费的回调集合 */
		[EPipelineStage.consume]?: {
			[identifier: TStageIdentifier]: IStageCallbackMap[EPipelineStage.consume]
		}
	}

	/** pipeline阶段回调 */
	interface IStageCallbackMap<T = any> {
		[EPipelineStage.subscribe]?(...prams: any[]): void
		[EPipelineStage.produce]?(...prams: any[]): any
		[EPipelineStage.process]?(lastValue: any): any
		[EPipelineStage.consume]?(value: T): void
	}

	interface IStageCallbacksMap {
		[EPipelineStage.subscribe]?: ((...prams: any[]) => void)[]
		[EPipelineStage.produce]?: (...prams: any[]) => any
		[EPipelineStage.process]?: ((lastValue: any) => any)[]
		[EPipelineStage.consume]?: ((value: any) => void)[]
	}

	type TStageIdentifier = `RPC_CALLBACK_${string}`

	/** pipeline阶段标识符 */
	interface IStageIdentifierMap {
		[EPipelineStage.subscribe]?: TStageIdentifier
		[EPipelineStage.produce]?: TStageIdentifier
		[EPipelineStage.process]?: TStageIdentifier
		[EPipelineStage.consume]?: TStageIdentifier
	}

	/** pipeline的标识符集合 */
	interface IStageIdentifiersMap {
		/** 订阅的回调集合 */
		[EPipelineStage.subscribe]?: TStageIdentifier[]
		/** 生产的回调集合 */
		[EPipelineStage.produce]?: TStageIdentifier
		/** 处理的回调集合 */
		[EPipelineStage.process]?: TStageIdentifier[]
		/** 消费的回调集合 */
		[EPipelineStage.consume]?: TStageIdentifier[]
	}

	interface IRpcResponse {
		res: (value?: any) => void
		rej: (reason?: any) => void
		isDestroy?: boolean
	}
}
