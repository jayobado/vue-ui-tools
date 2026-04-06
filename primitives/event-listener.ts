import { onScopeDispose } from 'vue'

type EventTarget = Window | Document | HTMLElement

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