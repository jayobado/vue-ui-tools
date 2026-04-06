import { ref, watch, onScopeDispose, toValue } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

export interface DebounceValueReturn<T> {
	value: Ref<T>
	dispose: () => void
}

export function useDebounce<T>(source: MaybeRefOrGetter<T>, delay: number = 300): DebounceValueReturn<T> {
	const debounced = ref(toValue(source)) as Ref<T>
	let timer: number | undefined

	const stopWatch = watch(
		() => toValue(source),
		(current) => {
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => {
				debounced.value = current
			}, delay) as unknown as number
		},
	)

	const dispose = () => {
		if (timer) clearTimeout(timer)
		stopWatch()
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return { value: debounced, dispose }
}

export function useDebounceFn<TArgs extends unknown[]>(
	fn: (...args: TArgs) => void,
	delay: number = 300,
): { call: (...args: TArgs) => void; cancel: () => void } {
	let timer: number | undefined

	function call(...args: TArgs): void {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => fn(...args), delay) as unknown as number
	}

	function cancel(): void {
		if (timer) clearTimeout(timer)
		timer = undefined
	}

	try { onScopeDispose(cancel) } catch { /* standalone */ }
	return { call, cancel }
}