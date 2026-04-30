import { ref, effectScope } from 'vue'
import type { Ref, EffectScope } from 'vue'
import { useEscapeKey } from '../primitives/escape-key.ts'
import { useFocusTrap } from '../primitives/focus-trap.ts'
import { useScrollLock } from '../primitives/scroll-lock.ts'
import { enter, leave } from '../primitives/transition.ts'
import type { TransitionClasses } from '../primitives/transition.ts'

/**
 * A composable function that provides modal dialog functionality. 
 * It manages the state of the modal, handles opening and closing the dialog, and provides support for features 
 * such as backdrop, focus trapping, scroll locking, and transitions. 
 * The modal can be customized with various options, including classes for styling, behavior on backdrop click and 
 * escape key press, and callbacks for open and close events.
 * 
 * @interface ModalOptions
 * @interface ModalReturn
 * @function useModal
 * @param options - An optional object containing configuration options for the modal dialog.
 * @returns An object with methods to open and close the modal, a reactive reference to the open state, and references to the backdrop and content elements.
 */
export interface ModalOptions {
	class?: string
	backdropClass?: string
	closeOnBackdrop?: boolean
	closeOnEscape?: boolean
	trapFocus?: boolean
	lockScroll?: boolean
	transition?: TransitionClasses
	backdropTransition?: TransitionClasses
	onOpen?: () => void
	onClose?: () => void
}

export interface ModalReturn {
	open: () => void
	close: () => Promise<void>
	isOpen: Ref<boolean>
	backdropEl: Ref<HTMLElement | null>
	contentEl: Ref<HTMLElement | null>
}

export function useModal(options?: ModalOptions): ModalReturn {
	const opts = options ?? {}
	const isOpen = ref(false)
	const backdropEl = ref<HTMLElement | null>(null)
	const contentEl = ref<HTMLElement | null>(null)

	let scope: EffectScope | null = null

	function open(): void {
		if (isOpen.value) return
		isOpen.value = true

		scope = effectScope()

		const backdrop = document.createElement('div')
		if (opts.backdropClass) backdrop.className = opts.backdropClass

		if (opts.closeOnBackdrop !== false) {
			backdrop.addEventListener('pointerdown', (e) => {
				if (e.target === backdrop) close()
			})
		}

		const wrapper = document.createElement('div')
		wrapper.setAttribute('role', 'dialog')
		wrapper.setAttribute('aria-modal', 'true')
		if (opts.class) wrapper.className = opts.class

		backdrop.appendChild(wrapper)
		document.body.appendChild(backdrop)

		backdropEl.value = backdrop
		contentEl.value = wrapper

		scope.run(() => {
			if (opts.closeOnEscape !== false) useEscapeKey(close)
			if (opts.trapFocus !== false) useFocusTrap(contentEl as Ref<HTMLElement | null>)
			if (opts.lockScroll !== false) useScrollLock()
		})

		if (opts.backdropTransition) enter(backdrop, opts.backdropTransition)
		if (opts.transition) enter(wrapper, opts.transition)

		opts.onOpen?.()
	}

	async function close(): Promise<void> {
		if (!isOpen.value) return
		isOpen.value = false

		if (opts.transition && contentEl.value) {
			await leave(contentEl.value, opts.transition)
		}
		if (opts.backdropTransition && backdropEl.value) {
			await leave(backdropEl.value, opts.backdropTransition)
		}

		scope?.stop()
		scope = null

		if (backdropEl.value?.parentNode) {
			backdropEl.value.parentNode.removeChild(backdropEl.value)
		}
		backdropEl.value = null
		contentEl.value = null

		opts.onClose?.()
	}

	return { open, close, isOpen, backdropEl, contentEl }
}