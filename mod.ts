/**
 * Vue Toolkit is a collection of utilities and helper functions designed to simplify the development of Vue components.
 * It provides a set of tools for defining functional components with type-safe props, creating VNodes with type inference, 
 * and managing memoization caches for performance optimization.
 * The toolkit is built on top of Vue's Composition API and leverages TypeScript's advanced type system to ensure type 
 * safety and improve the developer experience when working with Vue components.
 * 
 * The main features of Vue Toolkit include:
 * - A `defineFn` function for defining functional components with a props schema and a render function, which generates 
 * runtime prop validation and infers prop types in the render function.
 * - A collection of factory functions for creating VNodes for common HTML elements, with type inference for 
 * component props and children.
 * - A `createMemoCache` function for creating memoization caches for VNodes, which can be used to optimize 
 * performance by caching rendered VNodes based on their props.
 * 
 * Overall, Vue Toolkit aims to provide a more ergonomic and type-safe way to create Vue components, while also 
 * improving performance through memoization and efficient VNode creation.
 * 
 * @packageDocumentation
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