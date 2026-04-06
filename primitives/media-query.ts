import { ref, onScopeDispose } from 'vue'
import type { Ref } from 'vue'

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