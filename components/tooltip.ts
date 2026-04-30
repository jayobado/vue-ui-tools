import { ref, onScopeDispose } from 'vue'
import type { Ref } from 'vue'
import { computePosition } from '../primitives/position.ts'
import type { Placement } from '../primitives/position.ts'

/**
 * A composable function that provides tooltip functionality. 
 * It manages the visibility of the tooltip, handles showing and hiding the tooltip based on user interactions, 
 * and positions the tooltip relative to a trigger element. 
 * The tooltip can be customized with various options such as placement, offset, show and hide delays, and custom classes.
 * 
 * @interface TooltipOptions
 * @interface TooltipReturn
 * @function useTooltip
 * @param trigger - The element that triggers the tooltip.
 * @param options - An object containing configuration options for the tooltip.
 * @returns An object with a reactive reference to the tooltip's visibility and a dispose method to clean up the tooltip.
 */

export interface TooltipOptions {
	text: string
	placement?: Placement
	offset?: number
	showDelay?: number
	hideDelay?: number
	class?: string
}

export interface TooltipReturn {
	isVisible: Ref<boolean>
	dispose: () => void
}

export function useTooltip(
	trigger: HTMLElement,
	options: TooltipOptions,
): TooltipReturn {
	const {
		text,
		placement = 'top',
		offset = 8,
		showDelay = 200,
		hideDelay = 100,
	} = options

	const isVisible = ref(false)

	let tooltip: HTMLElement | null = null
	let showTimer: number | undefined
	let hideTimer: number | undefined

	function create(): HTMLElement {
		const el = document.createElement('div')
		el.setAttribute('role', 'tooltip')
		if (options.class) el.className = options.class
		el.style.position = 'fixed'
		el.style.pointerEvents = 'none'
		el.textContent = text
		return el
	}

	function show(): void {
		if (hideTimer) { clearTimeout(hideTimer); hideTimer = undefined }
		if (tooltip) return
		showTimer = setTimeout(() => {
			tooltip = create()
			document.body.appendChild(tooltip)
			const pos = computePosition(trigger, tooltip, { placement, offset })
			tooltip.style.top = `${pos.top}px`
			tooltip.style.left = `${pos.left}px`
			isVisible.value = true
		}, showDelay) as unknown as number
	}

	function hide(): void {
		if (showTimer) { clearTimeout(showTimer); showTimer = undefined }
		hideTimer = setTimeout(() => {
			if (tooltip?.parentNode) tooltip.parentNode.removeChild(tooltip)
			tooltip = null
			isVisible.value = false
		}, hideDelay) as unknown as number
	}

	trigger.addEventListener('mouseenter', show)
	trigger.addEventListener('mouseleave', hide)
	trigger.addEventListener('focus', show)
	trigger.addEventListener('blur', hide)

	function dispose(): void {
		if (showTimer) clearTimeout(showTimer)
		if (hideTimer) clearTimeout(hideTimer)
		trigger.removeEventListener('mouseenter', show)
		trigger.removeEventListener('mouseleave', hide)
		trigger.removeEventListener('focus', show)
		trigger.removeEventListener('blur', hide)
		if (tooltip?.parentNode) tooltip.parentNode.removeChild(tooltip)
		tooltip = null
		isVisible.value = false
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return { isVisible, dispose }
}