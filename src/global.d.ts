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

declare const enum EMode {
	development = 'development',
	qa = 'qa',
	production = 'production',
}

declare const MODE: EMode
declare const RELEASE_TYPE: 'develop' | 'product'
