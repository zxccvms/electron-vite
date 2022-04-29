type TChild<E> = {
	event: E
}

type TTarget<T, V> = T extends TChild<V> ? T : never

/** 类型守护 */
export const isType = <T, V>(
	target: TTarget<T, V>,
	value: V
): target is TTarget<T, V> => {
	return target.event === value
}
