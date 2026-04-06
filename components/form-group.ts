import { createVNode, type VNode, type VNodeArrayChildren } from 'vue'
import { css } from '../css.ts'
import type { StyleObject } from '../css.ts'

export interface FormGroupProps {
	class?: string
	styles?: StyleObject
	legend?: string
	legendStyles?: StyleObject
}

export function FormGroup(
	props: FormGroupProps,
	children: VNode | VNode[],
): VNode {
	const classes: string[] = []
	if (props.class) classes.push(props.class)
	if (props.styles) classes.push(css(props.styles))

	const fieldsetChildren: VNodeArrayChildren = []

	if (props.legend) {
		const legendClasses: string[] = []
		if (props.legendStyles) legendClasses.push(css(props.legendStyles))
		fieldsetChildren.push(
			createVNode('legend', {
				class: legendClasses.join(' ') || undefined,
			}, props.legend)
		)
	}

	fieldsetChildren.push(
		...(Array.isArray(children) ? children : [children])
	)

	return createVNode('fieldset', {
		class: classes.join(' ') || undefined,
	}, fieldsetChildren)
}