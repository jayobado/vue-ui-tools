import { render, type VNode } from 'vue'

/**
 * A utility function to create a portal, rendering a Vue component into a specified DOM element.
 * 
 * @param vnode 
 * @param target 
 * @returns 
 */

export function createPortal(
	vnode: VNode,
	target: HTMLElement = document.body,
): { container: HTMLElement; remove: () => void } {
	const container = document.createElement('div')
	target.appendChild(container)
	render(vnode, container)
	return {
		container,
		remove: () => {
			render(null, container)
			if (container.parentNode) container.parentNode.removeChild(container)
		},
	}
}