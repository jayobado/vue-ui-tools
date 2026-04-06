import { onScopeDispose } from 'vue'

export interface IntervalReturn {
	stop: () => void
	restart: () => void
}

export function useInterval(fn: () => void, delay: number, options?: { immediate?: boolean }): IntervalReturn {
	let id: number | undefined

	function start(): void {
		stop()
		if (options?.immediate) fn()
		id = setInterval(fn, delay) as unknown as number
	}

	function stop(): void {
		if (id !== undefined) {
			clearInterval(id)
			id = undefined
		}
	}

	function restart(): void {
		start()
	}

	start()

	try { onScopeDispose(stop) } catch { /* standalone */ }
	return { stop, restart }
}