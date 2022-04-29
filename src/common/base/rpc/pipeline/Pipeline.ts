import { EPipelineStage } from '../types'

/** 管道 */
class Pipeline<T = any> {
	/** 订阅列表 */
	private subscribe: ((...params: any[]) => void)[] = []
	/** 生产方法 */
	private produce: (...params: any[]) => T
	/** 处理列表 */
	private process: ((value: T) => T)[] = []
	/** 消费者列表 */
	private consume: ((value: T) => void)[] = []

	constructor(public name: string, stageCallbackMap: IStageCallbackMap) {
		console.debug(`"${name}" pipeline is creating`)
		if (!stageCallbackMap) throw `"${name}" pipeline is lack stageCallbackMap`

		this.register(stageCallbackMap)
	}

	async start(...params: any[]): Promise<T> {
		console.debug(`"${this.name}" pipeline is starting with params: `, params)

		this.subscribeStag(params)
		const product = await this.produceStag(params)
		const value = await this.processStag(product)
		this.consumeStag(value)

		return value
	}

	/** 订阅阶段 */
	private subscribeStag(params: any[]) {
		for (const subscribe of this.subscribe) {
			// 通知订阅者
			subscribe(...params)
		}
	}

	/** 生产阶段 */
	private async produceStag(params: any[]) {
		if (!this.produce) throw `"${this.name}" pipeline is lack produce callback`

		const value = await this.produce(...params)

		console.debug(`"${this.name}" pipeline produceStag's result: `, value)

		return value
	}

	/** 处理阶段 */
	private async processStag(value: T) {
		for (const process of this.process) {
			// 调用处理函数
			value = await process(value)
		}

		console.debug(`"${this.name}" pipeline processStag's result: `, value)

		return value
	}

	/** 消费阶段 */
	private consumeStag(value: any) {
		for (const consume of this.consume) {
			// 分发处理结果
			consume(value)
		}
	}

	/** 注册阶段函数 */
	register(stageCallbackMap: IStageCallbackMap) {
		for (const [stage, callback] of Object.entries(stageCallbackMap)) {
			this.insertStageCallback(stage as EPipelineStage, callback)
		}
	}

	private insertStageCallback<T extends EPipelineStage>(
		stage: T,
		callback: IStageCallbackMap[T]
	) {
		console.debug(
			`"${this.name}" pipeline is inserting "${stage}" stage callback: `,
			callback
		)
		if (!callback)
			throw `insertStageCallback callback param is lack in the "${this.name}" pipeline`

		switch (stage) {
			case EPipelineStage.produce: {
				if (this.produce === callback)
					return console.warn(
						`insert callback is same in the "${this.name}" pipeline's "${stage}" stage`
					)

				if (this[EPipelineStage.produce]) {
					console.warn(
						`"${this.name}" pipeline produce callback was covered`,
						callback
					)
				}
				this.produce = callback as IStageCallbackMap[EPipelineStage.produce]
				break
			}
			case EPipelineStage.subscribe:
			case EPipelineStage.process:
			case EPipelineStage.consume: {
				const attr =
					this[stage as Exclude<EPipelineStage, EPipelineStage.produce>]
				if (attr.find(cb => cb === callback))
					return console.warn(
						`insert callback is same in the "${this.name}" pipeline's "${stage}" stage`
					)

				attr.push(callback as any)
				break
			}
			default:
				console.warn(
					`"${this.name}" pipeline's "${stage}" stage is not support`
				)
		}
	}

	/** 注销阶段函数 */
	unregister(stageCallbackMap: IStageCallbackMap) {
		for (const [stage, callback] of Object.entries(stageCallbackMap)) {
			this.deleteStageCallback(stage as EPipelineStage, callback)
		}
	}

	/** 通过pipelineCallbackCollection注销阶段函数 */
	unregisterByStageCallbacksMap(stageCallbacksMap: IStageCallbacksMap) {
		for (const [stage, callback] of Object.entries(stageCallbacksMap)) {
			this.unregisterByStageCallbacks(
				stage as EPipelineStage,
				stage === EPipelineStage.produce ? [callback] : callback
			)
		}
	}

	/** 通过stageCallbackCollection注销阶段函数 */
	unregisterByStageCallbacks<T extends EPipelineStage>(
		stage: T,
		stageCallbacks: IStageCallbackMap[T][]
	) {
		for (const callback of stageCallbacks) {
			this.deleteStageCallback(stage, callback)
		}
	}

	/** 删除阶段函数 */
	private deleteStageCallback<T extends EPipelineStage>(
		stage: T,
		callback: IStageCallbackMap[T]
	) {
		console.debug(
			`"${this.name}" pipeline is deleting "${stage}" stage callback: `,
			callback
		)
		if (!callback)
			throw `deleteStageCallback callback param is lack in the "${this.name}" pipeline`

		switch (stage) {
			case EPipelineStage.produce: {
				if (this[EPipelineStage.produce] !== callback)
					return console.warn(
						`"${this.name}" pipeline's "${stage}" stage has not callback`
					)

				return (this[EPipelineStage.produce] = undefined)
			}
			case EPipelineStage.subscribe:
			case EPipelineStage.process:
			case EPipelineStage.consume: {
				const attr =
					this[stage as Exclude<EPipelineStage, EPipelineStage.produce>]
				const index = attr.indexOf(callback as any)
				if (index === -1)
					return console.warn(
						`"${this.name}" pipeline's "${stage}" stage has not callback`
					)

				attr.splice(index, 1)

				if (attr.length === 0)
					this[stage as Exclude<EPipelineStage, EPipelineStage.produce>] =
						undefined
				break
			}
			default:
				console.warn(
					`"${this.name}" pipeline's "${stage}" stage is not support`
				)
		}
	}

	shouldDestroy() {
		return Object.values(EPipelineStage).every(stage => !this[stage])
	}

	destroy() {
		console.debug(`"${this.name}" pipeline is destroying`)
		this.name = undefined
		this.subscribe = undefined
		this.produce = undefined
		this.process = undefined
		this.consume = undefined
	}
}

export default Pipeline
