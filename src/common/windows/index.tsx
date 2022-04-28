import 'src/common/styles/index.module.less'

import ReactDOM from 'react-dom/client'
import windowMap from './windowMap'
import asyncComponentWrapper from 'src/common/base/react/asyncComponentWrapper'
import { EWindowName } from 'src/global.enum'

function render(windowName: EWindowName) {
	const AsyncComponent = windowMap[windowName]
	const Component = asyncComponentWrapper(AsyncComponent)

	const rootDom = document.querySelector('#root')
	ReactDOM.createRoot(rootDom).render(<Component />)
}

render(EWindowName.test1)
