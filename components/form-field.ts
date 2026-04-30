import { createVNode, type VNode, type VNodeArrayChildren } from 'vue'

/**
 * A simple form field component for Vue. It accepts a label, an optional name for the input, an optional error message, 
 * and a required flag.
 */
export interface FormFieldProps {
	label: string
	name?: string
	error?: string
	required?: boolean
	class?: string
	labelClass?: string
	errorClass?: string
}

export function formField(
	props: FormFieldProps,
	children: VNode | VNode[],
): VNode {
	const { label, name, error, required } = props

	const labelText = required ? `${label} *` : label

	const fieldChildren: VNodeArrayChildren = [
		createVNode('label', {
			for: name,
			class: props.labelClass || undefined,
		}, labelText),
		...(Array.isArray(children) ? children : [children]),
	]

	if (error) {
		fieldChildren.push(
			createVNode('span', {
				class: props.errorClass || undefined,
				role: 'alert',
			}, error)
		)
	}

	return createVNode('div', {
		class: props.class || undefined,
	}, fieldChildren)
}