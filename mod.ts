/**
 * This module provides a collection of utilities and components for building Vue applications, 
 * inspired by React's component model and utility libraries. 
 * 
 * It includes functions for defining components, creating memoized values, and a set of pre-defined HTML element components.
 * 
 * @module vue-toolkit
 * @author Jay Obado
 * @license MIT
 * @see https://github.com/jayobado/vue-toolkit
 */

export {
	defineFn, define, html, withMemo, createMemoCache,
	shallowRef, markRaw,
} from './component.ts'
export type { NormalizedProps } from './component.ts'

export {
	div, section, article, aside, header, footer, main, nav,
	span, p, h1, h2, h3, h4, h5, h6, em, strong, small, code, pre,
	ul, ol, li,
	form, fieldset, label, input, button, select, textarea, option,
	img, a, hr, br,
	table, thead, tbody, tr, th, td,
} from './element.ts'
export type { ElProps, InputElProps, ButtonElProps, AnchorElProps } from './element.ts'