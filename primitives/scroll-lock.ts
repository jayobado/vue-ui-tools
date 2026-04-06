import { onScopeDispose } from 'vue'

export function useScrollLock(): () => void {
	const original = document.body.style.overflow
	document.body.style.overflow = 'hidden'

	const dispose = () => {
		document.body.style.overflow = original
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return dispose
}