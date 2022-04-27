import ReactDOM from 'react-dom/client'

import classMap from './app.module.less'

import test from 'src/common/base/react/test'
import test1 from 'src/common/base/react/test1'

console.log(`taozhizhu ~🚀 file: App.tsx ~🚀 line 6 ~🚀 test`, test)
console.log(`taozhizhu ~🚀 file: App.tsx ~🚀 line 7 ~🚀 test1`, test1)
console.log(`taozhizhu ~🚀 file: App.tsx ~🚀 line 7 ~🚀 noop`, noop)

interface IProps {}

const App: React.FC<IProps> = props => {
	return (
		<div className={classMap.test}>
			<img src={'./resources/factory/1.png'} />
		</div>
	)
}

ReactDOM.createRoot(document.querySelector('#root')).render(<App />)
