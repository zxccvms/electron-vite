import React, { Suspense, Component } from 'react'

interface IProps {
	onFinish: () => void
}

class Spinner extends Component<IProps> {
	render() {
		return '加载中...'
	}

	componentWillUnmount() {
		this.props.onFinish?.()
		console.log('加载完成')
	}
}

export default function asyncComponentWrapper(
	factory: () => Promise<{
		default: React.ComponentType<any>
	}>,
	onFinish?: () => void
): React.FC {
	const Component = React.lazy(factory)

	return props => (
		<Suspense fallback={<Spinner onFinish={onFinish} />}>
			<Component {...props} />
		</Suspense>
	)
}
