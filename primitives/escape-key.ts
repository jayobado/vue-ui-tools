import { onScopeDispose } from 'vue'

export function useEscapeKey(handler: () => void): () => void {
	function onKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape') handler()
	}

	document.addEventListener('keydown', onKeydown)

	const dispose = () => {
		document.removeEventListener('keydown', onKeydown)
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return dispose
}