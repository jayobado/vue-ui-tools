import { onScopeDispose } from 'vue'

/**
 * A composable function that locks the scroll on the body element.
 * 
 * This function sets the `overflow` style of the `body` element to `hidden`, preventing the user from scrolling the page.
 * It also returns a cleanup function that restores the original `overflow` style when called, allowing the scroll 
 * to be unlocked.
 * The cleanup function is automatically registered to be called when the component using this composable is unmounted, 
 * ensuring that the scroll lock is properly released.
 * 
 * @returns A function that unlocks the scroll when called.
 */
export function useScrollLock(): () => void {
	const original = document.body.style.overflow
	document.body.style.overflow = 'hidden'

	const dispose = () => {
		document.body.style.overflow = original
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return dispose
}