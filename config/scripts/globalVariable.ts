const defineGlobalVariable = ({ mode }: ICommandLineParams) => ({
	MODE: JSON.stringify(mode),
	RELEASE_TYPE: JSON.stringify('enterprise'),
})

export default defineGlobalVariable
