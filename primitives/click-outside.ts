import { onScopeDispose } from 'vue'
import type { Ref } from 'vue'

export function useClickOutside(
	target: Ref<HTMLElement | null | undefined>,
	handler: () => void,
): () => void {
	function onPointerDown(e: PointerEvent): void {
		const el = target.value
		if (!el) return
		if (!el.contains(e.target as Node)) handler()
	}

	document.addEventListener('pointerdown', onPointerDown)

	const dispose = () => {
		document.removeEventListener('pointerdown', onPointerDown)
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return dispose
}