import ReactDOM from 'react-dom/client'
import { EWindowName } from 'src/global.enum'

import classMap from './app.module.less'

console.log(`taozhizhu ~🚀 file: App.tsx ~🚀 line 7 ~🚀 noop`, noop)
console.log(`taozhizhu ~🚀 file: App.tsx ~🚀 line 7 ~🚀 test`, EWindowName.test)

interface IProps {}

const App: React.FC<IProps> = props => {
	return (
		<div className={classMap.test}>
			<img src={'./resources/factory/1.png'} />
		</div>
	)
}

ReactDOM.createRoot(document.querySelector('#root')).render(<App />)
