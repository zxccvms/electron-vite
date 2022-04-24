import ReactDOM from 'react-dom/client'

import classMap from './app.module.less'

interface IProps {}

const App: React.FC<IProps> = props => {
  return (
    <div className={classMap.test}>
      <img src={'./resources/factory/1.png'} />
    </div>
  )
}

ReactDOM.createRoot(document.querySelector('#root')).render(<App />)
