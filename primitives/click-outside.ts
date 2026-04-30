import { onScopeDispose } from 'vue'
import type { Ref } from 'vue'

/****
 * A composable function that detects clicks outside of a specified target element and invokes 
 * a handler function when such clicks occur.
 * 
 * 
 * It listens for pointer down and click events on the document, and determines if the click happened outside 
 * the target element and any specified ignored elements.
 * 
 * The function also provides an option to specify elements that should be ignored when determining if a click is outside, 
 * allowing for more flexible behavior.
 * 
 * It returns a cleanup function that removes the event listeners when called, ensuring that resources are properly 
 * released when the component using this composable is unmounted.
 * 
 * @param target - A reactive reference to the target HTMLElement that should be monitored for outside clicks.
 * @param handler - A callback function that will be invoked when a click outside the target element is detected.
 * @param ignore - An optional array of reactive references or CSS selectors for elements that should be ignored when determining if a click is outside.
 * @returns A function that can be called to remove the event listeners and clean up resources when the component is unmounted.
 */
export function useClickOutside(
	target: Ref<HTMLElement | null | undefined>,
	handler: () => void,
	ignore?: (Ref<HTMLElement | null | undefined> | string)[],
): () => void {
	let shouldFire = false

	function isIgnored(e: Event): boolean {
		if (!ignore) return false
		return ignore.some(item => {
			if (typeof item === 'string') {
				return Array.from(document.querySelectorAll(item))
					.some(el => el === e.target || e.composedPath().includes(el))
			}
			const el = item.value
			return el != null && (el === e.target || e.composedPath().includes(el))
		})
	}

	function onPointerDown(e: PointerEvent): void {
		const el = target.value
		if (!el) { shouldFire = false; return }
		if (isIgnored(e)) { shouldFire = false; return }
		shouldFire = !e.composedPath().includes(el)
	}

	function onClick(e: Event): void {
		if (!shouldFire) return
		shouldFire = false
		const el = target.value
		if (!el) return
		if (e.composedPath().includes(el)) return
		if (isIgnored(e)) return
		handler()
	}

	document.addEventListener('pointerdown', onPointerDown, { capture: true })
	document.addEventListener('click', onClick, { passive: true, capture: true })

	const dispose = () => {
		document.removeEventListener('pointerdown', onPointerDown, true)
		document.removeEventListener('click', onClick, true)
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return dispose
}