import { createVNode, type VNode, type VNodeArrayChildren } from 'vue'

/**
 * A simple form group component for Vue. It accepts an optional legend and a class for styling.
 */
export interface FormGroupProps {
	class?: string
	legend?: string
	legendClass?: string
}

export function formGroup(
	props: FormGroupProps,
	children: VNode | VNode[],
): VNode {
	const fieldsetChildren: VNodeArrayChildren = []

	if (props.legend) {
		fieldsetChildren.push(
			createVNode('legend', {
				class: props.legendClass || undefined,
			}, props.legend)
		)
	}

	fieldsetChildren.push(
		...(Array.isArray(children) ? children : [children])
	)

	return createVNode('fieldset', {
		class: props.class || undefined,
	}, fieldsetChildren)
}