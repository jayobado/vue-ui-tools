import { render, type VNode } from 'vue'

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