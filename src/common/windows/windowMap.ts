import { EWindowName } from 'src/global.enum'

const windowMap: Record<EWindowName, TWindowOptions> = {
	[EWindowName.test]: () => import('./test/index'),
	[EWindowName.test1]: () => import('./test1/index'),
}

export default windowMap
