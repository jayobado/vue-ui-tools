import { createVNode, type VNode, type VNodeArrayChildren } from 'vue'

type Child = VNode | string | number | null | undefined | false
type Children = Child | Child[] | VNodeArrayChildren

/**
 * A base interface for the props of all elements. 
 * It includes common HTML attributes and event handlers that can be applied to any element. 
 * This allows for flexible and type-safe usage of the element factory functions defined in this module.
 * 
 * The ElProps interface includes:
 * - Common HTML attributes such as class, id, style, role, tabIndex, title, key, and various aria-* attributes.
 * - Event handlers for common events like click, double click, mouse enter/leave, focus/blur, keydown/keyup, 
 * input/change/submit.
 * 
 * This interface can be extended by specific element prop interfaces (e.g., InputElProps, ButtonElProps) 
 * to include additional attributes relevant to those elements.
 * 
 * @interface ElProps
 */
export interface ElProps {
	[key: string]: unknown
	class?: string; id?: string; style?: string; role?: string
	tabIndex?: number; title?: string; key?: string | number
	'aria-label'?: string; 'aria-hidden'?: boolean | 'true' | 'false'
	'aria-expanded'?: boolean; 'aria-live'?: string
	onClick?: (e: MouseEvent) => void
	onDblclick?: (e: MouseEvent) => void
	onMouseenter?: (e: MouseEvent) => void
	onMouseleave?: (e: MouseEvent) => void
	onFocus?: (e: FocusEvent) => void
	onBlur?: (e: FocusEvent) => void
	onKeydown?: (e: KeyboardEvent) => void
	onKeyup?: (e: KeyboardEvent) => void
	onInput?: (e: Event) => void
	onChange?: (e: Event) => void
	onSubmit?: (e: Event) => void
}

/**
 * A base interface for the props of input elements. 
 * It extends the ElProps interface and includes additional attributes specific to input elements, 
 * such as type, value, placeholder, disabled, readonly, required, name, autocomplete, autofocus, min, and max.
 * 
 * This interface allows for flexible and type-safe usage of the input element factory function defined in this module.
 * 
 * @interface InputElProps
 */
export interface InputElProps extends ElProps {
	type?: string; value?: string; placeholder?: string; disabled?: boolean
	readonly?: boolean; required?: boolean; name?: string
	autocomplete?: string; autofocus?: boolean; min?: string; max?: string
}

/**
 * A base interface for the props of button elements. 
 * It extends the ElProps interface and includes additional attributes specific to button elements, 
 * such as type and disabled.
 * 
 * This interface allows for flexible and type-safe usage of the button element factory function defined in this module.
 * 
 * @interface ButtonElProps
 */
export interface ButtonElProps extends ElProps {
	type?: 'button' | 'submit' | 'reset'; disabled?: boolean
}

/**
 * A base interface for the props of anchor elements. 
 * It extends the ElProps interface and includes additional attributes specific to anchor elements, 
 * such as href, target, and rel.
 * 
 * This interface allows for flexible and type-safe usage of the anchor element factory function defined in this module.
 * 
 * @interface AnchorElProps
 */
export interface AnchorElProps extends ElProps {
	href?: string; target?: string; rel?: string
}

// ─── Element factory type ─────────────────────────────────────────────────────
// Explicit alias so JSR can resolve the type of every _h() export

type El = (props?: ElProps | null, children?: Children) => VNode

const _html = (tag: string): El =>
	(props?: ElProps | null, children?: Children): VNode =>
		createVNode(tag, props ?? null, children ?? null)

/**
 * A helper function for creating VNodes with type inference for component props. 
 * It takes a component, props, and children, and returns a VNode. 
 * The props are typed based on the component's prop definitions, and the children can be a string, 
 * a VNode, an array of VNodes, or an object representing slots.
 * 
 * @param component - The component to create a VNode for. This can be a functional component or a class-based component.
 * @param props - The props to pass to the component. The type of the props is inferred from the component's prop definitions.
 * @param children - The children to pass to the component. This can be a string, a VNode, an array of VNodes, or an object representing slots.
 * @returns A VNode representing the rendered component with the specified props and children.
 */

export const div: El = _html('div')
export const section: El = _html('section')
export const article: El = _html('article')
export const aside: El = _html('aside')
export const header: El = _html('header')
export const footer: El = _html('footer')
export const main: El = _html('main')
export const nav: El = _html('nav')

/**
 * 
 * A collection of factory functions for creating VNodes for common HTML elements. 
 * Each function corresponds to a specific HTML tag and accepts props and children as arguments. 
 * The props are typed based on the common attributes for that element, and the children can be a string, 
 * a VNode, an array of VNodes, or an object representing slots. 
 * These factory functions provide a convenient and type-safe way to create VNodes for standard HTML elements in Vue.
 */

export const span: El = _html('span')
export const p: El = _html('p')
export const h1: El = _html('h1')
export const h2: El = _html('h2')
export const h3: El = _html('h3')
export const h4: El = _html('h4')
export const h5: El = _html('h5')
export const h6: El = _html('h6')
export const em: El = _html('em')
export const strong: El = _html('strong')
export const small: El = _html('small')
export const code: El = _html('code')
export const pre: El = _html('pre')

// ─── Lists ────────────────────────────────────────────────────────────────────

export const ul: El = _html('ul')
export const ol: El = _html('ol')
export const li: El = _html('li')

// ─── Form ─────────────────────────────────────────────────────────────────────

export const form = (
	props?: (ElProps & { action?: string; method?: string; enctype?: string }) | null,
	children?: Children
): VNode => createVNode('form', props ?? null, children ?? null)

export const fieldset: El = _html('fieldset')

export const label = (
	props?: (ElProps & { for?: string }) | null,
	children?: Children
): VNode => createVNode('label', props ?? null, children ?? null)

export const input = (props?: InputElProps | null): VNode =>
	createVNode('input', props ?? null)

export const button = (props?: ButtonElProps | null, children?: Children): VNode =>
	createVNode('button', props ?? null, children ?? null)

export const select: El = _html('select')

export const textarea = (
	props?: (ElProps & { rows?: number; placeholder?: string }) | null
): VNode => createVNode('textarea', props ?? null)

export const option = (
	props?: (ElProps & { value?: string; selected?: boolean }) | null,
	children?: Children
): VNode => createVNode('option', props ?? null, children ?? null)

// ─── Media / navigation ───────────────────────────────────────────────────────

export const img = (
	props?: (ElProps & { src?: string; alt?: string; loading?: string }) | null
): VNode => createVNode('img', props ?? null)

export const a = (props?: AnchorElProps | null, children?: Children): VNode =>
	createVNode('a', props ?? null, children ?? null)

export const hr = (props?: ElProps | null): VNode =>
	createVNode('hr', props ?? null)

export const br = (): VNode => createVNode('br', null)

// ─── Table ────────────────────────────────────────────────────────────────────

export const table: El = _html('table')
export const thead: El = _html('thead')
export const tbody: El = _html('tbody')
export const tr: El = _html('tr')

export const th = (
	props?: (ElProps & { scope?: string; colSpan?: number }) | null,
	children?: Children
): VNode => createVNode('th', props ?? null, children ?? null)

export const td = (
	props?: (ElProps & { colSpan?: number }) | null,
	children?: Children
): VNode => createVNode('td', props ?? null, children ?? null)