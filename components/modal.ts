import { ref } from 'vue'
import type { Ref } from 'vue'
import { css } from '../css.ts'
import type { StyleObject } from '../css.ts'
import { useEscapeKey } from '../primitives/escape-key.ts'
import { useFocusTrap } from '../primitives/focus-trap.ts'
import { useScrollLock } from '../primitives/scroll-lock.ts'

export interface ModalOptions {
	class?: string
	styles?: StyleObject
	backdropClass?: string
	backdropStyles?: StyleObject
	closeOnBackdrop?: boolean
	closeOnEscape?: boolean
	trapFocus?: boolean
	lockScroll?: boolean
	onOpen?: () => void
	onClose?: () => void
}

export interface ModalReturn {
	open: () => void
	close: () => void
	isOpen: Ref<boolean>
	backdropEl: Ref<HTMLElement | null>
	contentEl: Ref<HTMLElement | null>
}

export function useModal(options?: ModalOptions): ModalReturn {
	const opts = options ?? {}
	const isOpen = ref(false)
	const backdropEl = ref<HTMLElement | null>(null)
	const contentEl = ref<HTMLElement | null>(null)

	let cleanups: Array<() => void> = []

	function open(): void {
		if (isOpen.value) return
		isOpen.value = true

		const backdrop = document.createElement('div')
		const backdropClasses: string[] = []
		if (opts.backdropClass) backdropClasses.push(opts.backdropClass)
		if (opts.backdropStyles) backdropClasses.push(css(opts.backdropStyles))
		if (backdropClasses.length) backdrop.className = backdropClasses.join(' ')

		if (opts.closeOnBackdrop !== false) {
			backdrop.addEventListener('pointerdown', (e) => {
				if (e.target === backdrop) close()
			})
		}

		const wrapper = document.createElement('div')
		wrapper.setAttribute('role', 'dialog')
		wrapper.setAttribute('aria-modal', 'true')
		const wrapperClasses: string[] = []
		if (opts.class) wrapperClasses.push(opts.class)
		if (opts.styles) wrapperClasses.push(css(opts.styles))
		if (wrapperClasses.length) wrapper.className = wrapperClasses.join(' ')

		backdrop.appendChild(wrapper)
		document.body.appendChild(backdrop)

		backdropEl.value = backdrop
		contentEl.value = wrapper

		if (opts.closeOnEscape !== false) {
			cleanups.push(useEscapeKey(close))
		}

		if (opts.trapFocus !== false) {
			cleanups.push(useFocusTrap(contentEl as Ref<HTMLElement | null>))
		}

		if (opts.lockScroll !== false) {
			cleanups.push(useScrollLock())
		}

		opts.onOpen?.()
	}

	function close(): void {
		if (!isOpen.value) return
		isOpen.value = false

		cleanups.forEach(fn => fn())
		cleanups = []

		if (backdropEl.value?.parentNode) {
			backdropEl.value.parentNode.removeChild(backdropEl.value)
		}
		backdropEl.value = null
		contentEl.value = null

		opts.onClose?.()
	}

	return { open, close, isOpen, backdropEl, contentEl }
}