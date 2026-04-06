import { createVNode, type VNode, type VNodeArrayChildren } from 'vue'
import { css } from '../css.ts'
import type { StyleObject } from '../css.ts'

export interface FormFieldProps {
	label: string
	name?: string
	error?: string
	required?: boolean
	class?: string
	styles?: StyleObject
	labelStyles?: StyleObject
	errorStyles?: StyleObject
}

export function FormField(
	props: FormFieldProps,
	children: VNode | VNode[],
): VNode {
	const { label, name, error, required } = props

	const classes: string[] = []
	if (props.class) classes.push(props.class)
	if (props.styles) classes.push(css(props.styles))

	const labelClasses: string[] = []
	if (props.labelStyles) labelClasses.push(css(props.labelStyles))

	const errorClasses: string[] = []
	if (props.errorStyles) errorClasses.push(css(props.errorStyles))

	const labelText = required ? `${label} *` : label

	const fieldChildren: VNodeArrayChildren = [
		createVNode('label', {
			for: name,
			class: labelClasses.join(' ') || undefined,
		}, labelText),
		...(Array.isArray(children) ? children : [children]),
	]

	if (error) {
		fieldChildren.push(
			createVNode('span', {
				class: errorClasses.join(' ') || undefined,
				role: 'alert',
			}, error)
		)
	}

	return createVNode('div', {
		class: classes.join(' ') || undefined,
	}, fieldChildren)
}