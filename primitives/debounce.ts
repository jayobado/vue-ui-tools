import { ref, watch, onScopeDispose, toValue } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

/**
 * A composable function that provides a debounced reactive value.
 * 
 * It allows you to create a reactive value that updates only after a specified delay, 
 * preventing rapid changes from triggering unnecessary updates.
 * 
 * The function also provides a dispose method to clean up any timers when the component is unmounted or the scope is disposed.
 * 
 * @param source - A reactive reference or getter function to debounce.
 * @param delay - The debounce delay in milliseconds. Default is 300ms.
 * @returns An object containing the debounced value and a dispose function.
 */

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