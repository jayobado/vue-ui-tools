import { onScopeDispose } from 'vue'
import type { Ref } from 'vue'

const FOCUSABLE = [
	'a[href]', 'button:not([disabled])', 'input:not([disabled])',
	'select:not([disabled])', 'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join(',')

export function useFocusTrap(container: Ref<HTMLElement | null | undefined>): () => void {
	let previousFocus: Element | null = null

	function getFocusable(): HTMLElement[] {
		const el = container.value
		if (!el) return []
		return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE))
	}

	function onKeydown(e: KeyboardEvent): void {
		if (e.key !== 'Tab') return
		const focusable = getFocusable()
		if (focusable.length === 0) return

		const first = focusable[0]
		const last = focusable[focusable.length - 1]

		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault()
				last.focus()
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault()
				first.focus()
			}
		}
	}

	previousFocus = document.activeElement
	document.addEventListener('keydown', onKeydown)
	const focusable = getFocusable()
	if (focusable.length) focusable[0].focus()

	const dispose = () => {
		document.removeEventListener('keydown', onKeydown)
		if (previousFocus instanceof HTMLElement) previousFocus.focus()
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return dispose
}