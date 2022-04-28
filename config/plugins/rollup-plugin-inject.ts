import inject from '@rollup/plugin-inject'
import { getPath } from '../utils'

/** 注入模块 */
const injectWrapper = () => {
	return inject({
		sourceMap: true,
		include: /\.[tj]sx?$/,
		noop: getPath('./src/common/base/utils/noop.ts'),
	})
}

export default injectWrapper
