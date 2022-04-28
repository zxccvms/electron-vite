import { EMode } from 'src/global.enum'

declare global {
	interface ICommandLineParams {
		mode: EMode
		bot?: boolean
		port?: number
	}
}
