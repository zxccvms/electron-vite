import classMap from './style/index.module.less'

interface IProps {}
console.log(`taozhizhu ~🚀 file: index.tsx ~🚀 line 4 ~🚀 IProps`)

const Test: React.FC<IProps> = props => {
	return <div className={classMap.test}>test</div>
}

export default Test
