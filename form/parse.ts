import type { StandardSchemaV1 } from '@standard-schema/spec'
import { ref, toValue, watchEffect } from 'vue'
import type { MaybeRefOrGetter, Ref, WatchOptionsBase } from 'vue'

import type { ErrorsFormatter, StandardErrors } from './errors.ts'

/**
 * A composable function that provides parsing and validation functionality for form inputs using a standardized schema.
 * It takes an input value and a schema, validates the input against the schema, and returns the validation result, 
 * the parsed output, and any formatted errors.
 * The function supports both synchronous and asynchronous validation, and allows for custom error 
 * formatting through the `formatErrors` option.
 * 
 * @interface ParseOptions
 * @interface ParseReturn
 * @function useParse
 * @param options - An object containing configuration options for parsing and validation, including the input value, schema, and error formatting function.
 * @param watchOptions - Optional Vue watch options to control the behavior of the reactive effect that performs validation.
 * @returns An object containing reactive references to the validation result, parsed output, and formatted errors.
 */


export interface ParseOptions<TSchema extends StandardSchemaV1, TErrors> {
	input?: MaybeRefOrGetter<unknown>
	schema: MaybeRefOrGetter<TSchema>
	formatErrors?: ErrorsFormatter<TErrors>
}

export interface ParseReturn<TSchema extends StandardSchemaV1, TErrors> {
	result: Ref<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>
	output: Ref<StandardSchemaV1.InferOutput<TSchema> | undefined>
	errors: Ref<TErrors | undefined>
}

// ─── Implementation ──────────────────────────────────────────────────────────

export function useParse<TSchema extends StandardSchemaV1, TErrors = StandardErrors>(
	options: ParseOptions<TSchema, TErrors>,
	watchOptions?: WatchOptionsBase,
): ParseReturn<TSchema, TErrors> {
	type Output = StandardSchemaV1.InferOutput<TSchema>

	const result = ref() as Ref<StandardSchemaV1.Result<Output>>
	const output = ref<Output>()
	const errors = ref<TErrors>()
	const formatErrors = options.formatErrors ?? ((issues: StandardErrors) => issues as TErrors)

	function apply(r: StandardSchemaV1.Result<Output>): void {
		result.value = r
		if (r.issues) {
			output.value = undefined
			errors.value = formatErrors(r.issues)
		} else {
			output.value = r.value
			errors.value = undefined
		}
	}

	watchEffect((onCleanup) => {
		const schema = toValue(options.schema)
		const input = toValue(options.input)
		const resultOrPromise = schema['~standard'].validate(input)

		if (resultOrPromise instanceof Promise) {
			let cancelled = false
			onCleanup(() => { cancelled = true })
			resultOrPromise.then(r => {
				if (!cancelled) apply(r)
			})
		} else {
			apply(resultOrPromise)
		}
	}, watchOptions)

	return { result, output, errors }
}