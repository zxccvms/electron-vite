import classMap from './style/index.module.less'

interface IProps {}
console.log(`taozhizhu ~🚀 file: index.tsx ~🚀 line 4 ~🚀 IProps1`)

const Test1: React.FC<IProps> = props => {
	return <div className={classMap.test}>test1</div>
}

export default Test1
