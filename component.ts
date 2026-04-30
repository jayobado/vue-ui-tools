import {
	createVNode,
	defineComponent,
	markRaw,
	shallowRef,
	type FunctionalComponent,
	type SetupContext,
	type VNode,
	type PropType,
	type Component,
	type VNodeProps,
	type VNodeArrayChildren,
} from 'vue'

// ─── Prop schema types ────────────────────────────────────────────────────────

type PropDescriptor<T> =
	| { type: PropType<T>; required: true; default?: never }
	| { type: PropType<T>; required?: false; default: T }
	| { type: PropType<T>; required?: false; default?: undefined }

type PropsSchema<P extends Record<string, unknown>> = {
	[K in keyof P]: PropDescriptor<P[K]>
}

type InferProps<S extends PropsSchema<Record<string, unknown>>> = {
	[K in keyof S]: S[K] extends PropDescriptor<infer T> ? T : never
}

type RequiredKeys<S> = {
	[K in keyof S]: S[K] extends { required: true } ? K : never
}[keyof S]

type OptionalKeys<S> = Exclude<keyof S, RequiredKeys<S>>

/**
 * Normalizes a PropsSchema into a type where required props are non-optional and optional props are optional. T
 * his is the type that will be used for the props argument in the render and setup functions.
 */
export type NormalizedProps<S extends PropsSchema<Record<string, unknown>>> = {
	[K in RequiredKeys<S>]: S[K] extends PropDescriptor<infer T> ? T : never
} & {
	[K in OptionalKeys<S>]?: S[K] extends PropDescriptor<infer T> ? T : never
}

// ─── Internal types ───────────────────────────────────────────────────────────

type RawSetup = (
	props: Record<string, unknown>,
	ctx: SetupContext
) => () => VNode | null

/**
 * 
 * Defines a functional component with a props schema and a render function. The props schema is used to infer the types of the props in the render function, and also to generate the runtime prop validation for Vue.
 * 
 * @param config 
 * @returns 
 * 
 */
export function defineFn<S extends PropsSchema<Record<string, unknown>>>(config: {
	name?: string
	props: S
	render: (
		props: NormalizedProps<S>,
		ctx: Omit<SetupContext, 'expose'>
	) => VNode | null
}): FunctionalComponent<NormalizedProps<S>> {
	const component: FunctionalComponent<NormalizedProps<S>> = (props, ctx) =>
		config.render(props, ctx) ?? createVNode('span')

	// Object.assign sidesteps the FunctionalComponent.props type constraint.
	// Type safety is enforced by PropsSchema<S> at the call site — by the time
	// we assign to the component Vue only needs the runtime descriptor shape.
	Object.assign(component, {
		props: Object.fromEntries(
			Object.entries(config.props).map(([k, v]) => [k, v])
		),
		displayName: config.name,
	})

	return markRaw(component)
}

/**
 * Defines a component with a props schema and a setup function. 
 * The props schema is used to infer the types of the props in the setup function, 
 * and also to generate the runtime prop validation for Vue.
 * 
 * @param config 
 * @returns 
 * 
 */
export function define<S extends PropsSchema<Record<string, unknown>>>(config: {
	name: string
	props: S
	setup: (
		props: Readonly<InferProps<S>>,
		ctx: SetupContext
	) => () => VNode | null
}): Component {
	const options: unknown = {
		name: config.name,
		props: Object.fromEntries(
			Object.entries(config.props).map(([k, v]) => [k, v])
		),
		setup: config.setup as RawSetup,
	}

	return markRaw(
		defineComponent(options as Parameters<typeof defineComponent>[0])
	)
}

// ─── withMemo ─────────────────────────────────────────────────────────────────

interface MemoVNode extends VNode {
	_memo?: unknown[]
}

/**
 * A helper function for memoizing VNodes based on dependencies. 
 * It checks if the cached VNode is still valid by comparing the dependencies, and if so, returns the cached VNode. 
 * Otherwise, it calls the render function to create a new VNode, caches it, and returns it.
 * 
 * @param deps - An array of dependencies that the memoized VNode depends on.
 * @param render - A function that returns a VNode to be memoized.
 * @param cache - An array used to store cached VNodes. The index parameter specifies where in the cache to store the new VNode.
 * @param index - The index in the cache array where the new VNode should be stored.
 * @returns A memoized VNode based on the provided dependencies and render function.
 */
export function withMemo<T extends MemoVNode>(
	deps: unknown[],
	render: () => T,
	cache: (T | undefined)[],
	index: number,
): T {
	const cached = cache[index]
	if (cached && isMemoSame(cached, deps)) return cached
	const ret = render()
	ret._memo = deps
	cache[index] = ret
	return ret
}

function isMemoSame(cached: MemoVNode, deps: unknown[]): boolean {
	const memo = cached._memo
	if (!memo || memo.length !== deps.length) return false
	for (let i = 0; i < deps.length; i++) {
		if (deps[i] !== memo[i]) return false
	}
	return true
}

/**
 * Creates a memoization cache for VNodes. The cache is an array of a specified size, initialized with undefined values. 
 * The array is marked as raw to prevent Vue from making it reactive, 
 * which is important for performance when using it as a memoization cache.
 * 
 * @param size - The size of the memoization cache, i.e., the number of VNodes that can be cached.
 * @returns An array that can be used as a memoization cache for VNodes.
 */
export function createMemoCache(size: number): (MemoVNode | undefined)[] {
	return markRaw(new Array<MemoVNode | undefined>(size).fill(undefined))
}

// ─── h() ──────────────────────────────────────────────────────────────────────

type ExtractComponentProps<C> =
	C extends FunctionalComponent<infer P, Record<PropertyKey, never>>
	? P
	: C extends abstract new (...args: unknown[]) => { $props: infer P }
	? P
	: C extends { new(...args: unknown[]): { $props: infer P } }
	? P
	: C extends { __props: infer P }
	? P
	: Record<string, unknown>

type NormalisedChildren =
	| string
	| VNode
	| VNode[]
	| VNodeArrayChildren
	| Record<string, () => VNode | VNode[] | null>
	| null

function normaliseChildren(
	children:
		| VNode
		| VNode[]
		| Record<string, () => VNode | VNode[] | null>
		| string
		| null
		| undefined
): NormalisedChildren {
	if (children == null) return null
	if (typeof children === 'string') return children
	if (Array.isArray(children)) return children
	if ('type' in (children as object)) return [children as VNode]
	return children as Record<string, () => VNode | VNode[] | null>
}

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
export function html<C>(
	component: C,
	props?: (ExtractComponentProps<C> & VNodeProps) | null,
	children?:
		| VNode
		| VNode[]
		| Record<string, () => VNode | VNode[] | null>
		| string
		| null,
): VNode {
	return createVNode(
		component as Parameters<typeof createVNode>[0],
		props ?? null,
		normaliseChildren(children)
	)
}

export { shallowRef, markRaw, createVNode }