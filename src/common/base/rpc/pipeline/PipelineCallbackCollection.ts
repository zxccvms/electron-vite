import { EPipelineStage } from '../types'

class PipelineCallbackCollection {
	/** 订阅的回调集合 */
	private [EPipelineStage.subscribe]: IPipelineCallbackCollection[EPipelineStage.subscribe]
	/** 生产的回调集合 */
	private [EPipelineStage.produce]: IPipelineCallbackCollection[EPipelineStage.produce]
	/** 处理的回调集合 */
	private [EPipelineStage.process]: IPipelineCallbackCollection[EPipelineStage.process]
	/** 消费的回调集合 */
	private [EPipelineStage.consume]: IPipelineCallbackCollection[EPipelineStage.consume]

	constructor(public name: string) {}

	getStageIdentifiersMap(): IStageIdentifiersMap {
		const result = {}
		if (this[EPipelineStage.subscribe])
			result[EPipelineStage.subscribe] = Object.keys(
				this[EPipelineStage.subscribe]
			)
		if (this[EPipelineStage.produce])
			result[EPipelineStage.produce] = this[EPipelineStage.produce].identifier

		if (this[EPipelineStage.process])
			result[EPipelineStage.process] = Object.keys(this[EPipelineStage.process])
		if (this[EPipelineStage.consume])
			result[EPipelineStage.consume] = Object.keys(this[EPipelineStage.consume])

		return result
	}

	/** 得到一个阶段回调集合 */
	getStageCallbackCollection<T extends EPipelineStage>(
		stage: T
	): IPipelineCallbackCollection[T] {
		switch (stage) {
			case EPipelineStage.subscribe:
			case EPipelineStage.produce:
			case EPipelineStage.process:
			case EPipelineStage.consume:
				return this[stage] as any
			default:
				console.warn(
					`"${this.name}" pipelineCallbackCollection's "${stage}" stage is not support`
				)
		}
	}

	/** 得到阶段回调 */
	getStageCallback<T extends EPipelineStage>(
		stage: T,
		identifier: TStageIdentifier
	): IStageCallbackMap[T] {
		const stageCallbackCollection = this.getStageCallbackCollection(stage)
		if (stage === EPipelineStage.produce) {
			const { identifier: cacheIdentifier, callback } =
				stageCallbackCollection as IPipelineCallbackCollection[EPipelineStage.produce]
			if (cacheIdentifier !== identifier) {
				console.warn(
					`"${identifier}" callback is not existed in the "${this.name}" pipelineCallbackCollection's "${stage}" stage`
				)
				return
			}

			return callback
		} else if (stageCallbackCollection) {
			const stageCallback = (
				stageCallbackCollection as IPipelineCallbackCollection[Exclude<
					EPipelineStage,
					EPipelineStage.produce
				>]
			)[identifier]
			if (!stageCallback) {
				console.warn(
					`"${identifier}" callback is not existed in the "${this.name}" pipelineCallbackCollection's "${stage}" stage`
				)
				return
			}

			return stageCallback
		}
	}

	/** 推入一个阶段回调 */
	pushStageCallback<T extends EPipelineStage>(
		stage: T,
		identifier: TStageIdentifier,
		callback: IStageCallbackMap[T]
	): void {
		console.debug(
			`"${this.name}" pipelineCallbackCollection is pushing "${stage}" stage "${identifier}" callback: `,
			callback
		)
		if (!callback)
			throw `pushStageCallback callback param is lack in the "${this.name}" pipelineCallbackCollection`

		switch (stage) {
			case EPipelineStage.produce: {
				if (this[EPipelineStage.produce])
					console.warn(
						`"${identifier}" callback is cancelling in the "${this.name}" pipelineCallbackCollection's "${stage}" stage`
					)

				this[EPipelineStage.produce] = {
					identifier,
					callback,
				}
				break
			}
			case EPipelineStage.subscribe:
			case EPipelineStage.process:
			case EPipelineStage.consume: {
				const stageCallbackCollection = (this[
					stage as Exclude<EPipelineStage, EPipelineStage.produce>
				] = this[stage] || {})
				const stageCallback = stageCallbackCollection[identifier]
				if (stageCallback)
					console.warn(
						`"${identifier}" callback is cancelling in the "${this.name}" pipelineCallbackCollection's "${stage}" stage`
					)

				stageCallbackCollection[identifier] = callback
				break
			}
			default:
				console.warn(
					`"${this.name}" pipelineCallbackCollection's "${stage}" stage is not support`
				)
		}
	}

	private _popStageCallback<T extends EPipelineStage>(
		stage: T,
		identifier: TStageIdentifier
	): IStageCallbackMap[T] {
		const stageCallback = this.getStageCallback(stage, identifier)
		console.debug(
			`"${this.name}" pipelineCallbackCollection is popping "${stage}" stage "${identifier}" callback: `,
			stageCallback
		)

		if (stage === EPipelineStage.produce) {
			this[stage as EPipelineStage.produce] = undefined
		} else {
			delete this[stage][identifier]
		}

		return stageCallback
	}

	/** 推出一个阶段回调 */
	popStageCallback<T extends EPipelineStage>(
		stage: T,
		identifier: TStageIdentifier
	): IStageCallbackMap[T] {
		const stageCallback = this._popStageCallback(stage, identifier)

		this.clear(stage)
		return stageCallback
	}

	/** 推出一个阶段回调 */
	popStageCallbacks<T extends EPipelineStage>(
		stage: T,
		identifiers: TStageIdentifier[]
	): IStageCallbackMap[T][] {
		const stageCallbacks = identifiers.map(identifier =>
			this._popStageCallback(stage, identifier)
		)

		this.clear(stage)
		return stageCallbacks
	}

	/** 推出阶段函数映射表 */
	popStageCallbackMap(stageIdentifierMap: IStageIdentifierMap) {
		const result: IStageCallbackMap = {}
		for (const [stage, identifier] of Object.entries(stageIdentifierMap) as [
			EPipelineStage,
			TStageIdentifier
		][]) {
			const stageCallback = this.popStageCallback(stage, identifier)
			result[stage] = stageCallback
		}

		return result
	}

	/** 推出阶段函数列表映射表 */
	popStageCallbacksMap(stageIdentifiersMap: IStageIdentifiersMap) {
		const result: IStageCallbacksMap = {}
		for (const [stage, identifiers] of Object.entries(stageIdentifiersMap) as [
			EPipelineStage,
			TStageIdentifier | TStageIdentifier[]
		][]) {
			if (stage === EPipelineStage.produce) {
				const callback = this.popStageCallback(
					stage,
					identifiers as TStageIdentifier
				)
				result[stage] = callback
			} else {
				const callbacks = this.popStageCallbacks(
					stage,
					identifiers as TStageIdentifier[]
				)
				result[stage] = callbacks
			}
		}

		return result
	}

	/** 清理空的阶段集合 */
	clear(stage?: EPipelineStage) {
		if (stage) {
			this.clearEmptyStageCallbackCollection(stage)
		} else {
			for (const stage of Object.values(EPipelineStage)) {
				this.clearEmptyStageCallbackCollection(stage)
			}
		}
	}

	/** 清理空的阶段回调集合 */
	private clearEmptyStageCallbackCollection(stage: EPipelineStage): void {
		switch (stage) {
			case EPipelineStage.produce:
				return
			case EPipelineStage.subscribe:
			case EPipelineStage.process:
			case EPipelineStage.consume: {
				const stageCallbackCollection = this[stage]
				if (!stageCallbackCollection) return
				else if (Object.keys(stageCallbackCollection).length) return
				return (this[stage] = undefined)
			}
			default:
				console.warn(
					`"${this.name}" pipelineCallbackCollection's "${stage}" stage is not support`
				)
		}
	}

	/** 应该销毁？ */
	shouldDestroy() {
		return Object.values(EPipelineStage).every(stage => !this[stage])
	}

	destroy() {
		console.debug(`"${this.name}" pipelineCallbackCollection is destroying`)
		this.name = undefined
		this[EPipelineStage.subscribe] = undefined
		this[EPipelineStage.produce] = undefined
		this[EPipelineStage.process] = undefined
		this[EPipelineStage.consume] = undefined
	}
}

export default PipelineCallbackCollection
