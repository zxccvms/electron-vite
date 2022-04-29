import Pipeline from './Pipeline'

/** 管道管理器 */
class PipelineManager implements IManager<Pipeline> {
	private pipelineMap: Map<string, Pipeline> = new Map()

	insert(pipeline: Pipeline) {
		if (this.pipelineMap.get(pipeline.name))
			throw `The inserted "${pipeline.name}" pipeline already exists`

		this.pipelineMap.set(pipeline.name, pipeline)
	}

	delete(name: string) {
		if (!this.pipelineMap.get(name))
			throw `The deleted "${name}" pipeline does not exist`

		this.pipelineMap.delete(name)
	}

	update(pipeline: Pipeline) {
		if (this.pipelineMap.get(pipeline.name))
			console.warn(`The updated "${pipeline.name}" pipeline to: `, pipeline)

		this.pipelineMap.set(pipeline.name, pipeline)
	}

	select(name: string) {
		return this.pipelineMap.get(name)
	}
}

export default PipelineManager
