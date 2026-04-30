import { onScopeDispose } from 'vue'

/**
 * A composable function that listens for the Escape key press and executes a provided handler 
 * function when the key is pressed.
 * 
 * It adds an event listener to the document for the 'keydown' event and checks if the pressed key is 'Escape'.
 * 
 * The function also returns a cleanup function that removes the event listener when called, ensuring 
 * that there are no memory leaks or unintended behavior when the component using this composable is unmounted.
 * 
 * @param handler - A function to be executed when the Escape key is pressed.
 * @returns A function that removes the event listener when called.
 */
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