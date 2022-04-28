import { EMode } from './global.enum'

declare global {
	declare module '*.less' {
		const classMap: {
			[key in string]: string
		}
		export default classMap
	}

	declare module '*.png' {
		const src: string
		export default src
	}

	declare const MODE: EMode
	declare const RELEASE_TYPE: 'develop' | 'product'
	declare const noop: () => void
}
