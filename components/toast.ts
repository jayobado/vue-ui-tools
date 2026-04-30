import { enter, leave } from '../primitives/transition.ts'
import type { TransitionClasses } from '../primitives/transition.ts'

/**
 * A simple toast notification system for Vue. It provides a `useToaster` composable function that allows you to 
 * show toast messages with various options such as duration, variant, and custom classes. 
 * 
 * The toasts are displayed in a container that can be styled and positioned as needed. 
 * Each toast can be dismissed by clicking on it, and it will automatically disappear after the specified duration.
 * 
 * @interface ToastOptions
 * @interface ToasterOptions
 * @interface Toaster
 * @type ToastVariant
 * @function useToaster
 * @param options - An optional object containing configuration options for the toaster.
 * @returns An object with a `show` method to display toast messages and a `dispose` method to clean up the toaster.
 */

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export interface ToastOptions {
	duration?: number
	variant?: ToastVariant
	class?: string
	dismissible?: boolean
	transition?: TransitionClasses
}

export interface ToasterOptions {
	containerClass?: string
	variantClass?: Partial<Record<ToastVariant, string>>
	transition?: TransitionClasses
}

export interface Toaster {
	show: (message: string, options?: ToastOptions) => void
	dispose: () => void
}

export function useToaster(options?: ToasterOptions): Toaster {
	const opts = options ?? {}

	const container = document.createElement('div')
	container.setAttribute('aria-live', 'polite')
	container.setAttribute('role', 'status')
	if (opts.containerClass) container.className = opts.containerClass

	document.body.appendChild(container)

	function show(message: string, toastOpts?: ToastOptions): void {
		const {
			duration = 3000,
			variant = 'info',
			dismissible = true,
		} = toastOpts ?? {}

		const transition = toastOpts?.transition ?? opts.transition

		const toast = document.createElement('div')
		toast.setAttribute('role', 'alert')

		const classes: string[] = []
		if (toastOpts?.class) classes.push(toastOpts.class)
		if (opts.variantClass?.[variant]) classes.push(opts.variantClass[variant]!)
		if (classes.length) toast.className = classes.join(' ')

		toast.textContent = message

		let timer: number | undefined
		let removing = false

		async function remove(): Promise<void> {
			if (removing) return
			removing = true
			if (timer) clearTimeout(timer)
			if (transition) {
				await leave(toast, transition)
			}
			if (toast.parentNode === container) {
				container.removeChild(toast)
			}
		}

		if (dismissible) {
			toast.style.cursor = 'pointer'
			toast.addEventListener('click', () => remove())
		}

		container.appendChild(toast)

		if (transition) enter(toast, transition)

		if (duration > 0) {
			timer = setTimeout(remove, duration) as unknown as number
		}
	}

	function dispose(): void {
		if (container.parentNode) container.parentNode.removeChild(container)
	}

	return { show, dispose }
}