import { ref, onScopeDispose } from 'vue'
import type { Ref } from 'vue'

/**
 * A composable function that provides a reactive interface to the browser's matchMedia API for responsive design.
 * 
 * It allows you to easily track whether a given media query matches the current viewport, and automatically updates 
 * the reactive state when the viewport changes.
 * 
 * The function also provides a dispose method to clean up event listeners when the 
 * component is unmounted or the scope is disposed.
 * 
 * @param query - The media query string to evaluate (e.g., '(max-width: 600px)').
 * @returns An object containing a reactive reference indicating if the media query matches and a dispose method for cleanup.
 */

export interface MediaQueryReturn {
	matches: Ref<boolean>
	dispose: () => void
}

export function useMediaQuery(query: string): MediaQueryReturn {
	const mql = globalThis.matchMedia(query)
	const matches = ref(mql.matches)

	function onChange(e: MediaQueryListEvent): void {
		matches.value = e.matches
	}

	mql.addEventListener('change', onChange)

	const dispose = () => {
		mql.removeEventListener('change', onChange)
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return { matches, dispose }
}