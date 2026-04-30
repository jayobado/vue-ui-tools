import { onScopeDispose } from 'vue'

type EventTarget = Window | Document | HTMLElement

/**
 * A composable function that adds an event listener to a specified target and returns a cleanup function.
 * 
 * It ensures that the event listener is removed when the component is unmounted or the scope is disposed,
 * preventing memory leaks and unintended behavior.
 * 
 * @param target - The target to which the event listener will be added (Window, Document, or HTMLElement).
 * @param event - The event type to listen for.
 * @param handler - The function to be executed when the event is triggered.
 * @param options - Optional parameters for the event listener.
 * @returns A function that removes the event listener when called.
 */

export function useEventListener<K extends keyof WindowEventMap>(
	target: Window,
	event: K,
	handler: (e: WindowEventMap[K]) => void,
	options?: AddEventListenerOptions,
): () => void

export function useEventListener<K extends keyof DocumentEventMap>(
	target: Document,
	event: K,
	handler: (e: DocumentEventMap[K]) => void,
	options?: AddEventListenerOptions,
): () => void

export function useEventListener<K extends keyof HTMLElementEventMap>(
	target: HTMLElement,
	event: K,
	handler: (e: HTMLElementEventMap[K]) => void,
	options?: AddEventListenerOptions,
): () => void

export function useEventListener(
	target: EventTarget,
	event: string,
	handler: (e: Event) => void,
	options?: AddEventListenerOptions,
): () => void {
	target.addEventListener(event, handler, options)

	const dispose = () => {
		target.removeEventListener(event, handler, options)
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return dispose
}