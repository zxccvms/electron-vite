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
	/** 空函数 */
	declare const noop: () => void
	/** 随机字符串 */
	declare const randomString: (length?: number) => string
	/** 与服务进程通信的模块 */
	declare const communicationModule: ICommunicationModule

	/** 管理器的接口 */
	declare interface IManager<T> {
		insert(item: T): void
		delete(id: string): void
		update(item: T): void
		select(id: string): T
	}
}
