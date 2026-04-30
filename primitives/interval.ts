import { onScopeDispose } from 'vue'

/**
 * A composable function that provides an interval mechanism for executing a function at specified intervals.
 * It allows you to start, stop, and restart the interval, and also supports an option for immediate execution.
 * The function ensures that the interval is properly cleaned up when the component using it is unmounted, 
 * preventing memory leaks and unintended behavior.
 * 
 * @param fn - The function to be executed at each interval.
 * @param delay - The time in milliseconds between each execution of the function.
 * @param options - Optional parameters for configuring the interval behavior (e.g., immediate execution).
 * @returns An object containing methods to stop and restart the interval.
 */

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