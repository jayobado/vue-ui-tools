import type { StandardSchemaV1 } from '@standard-schema/spec'
import { ref, toValue } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

import type { ErrorsFormatter, StandardErrors } from './errors.ts'

/***
 * 
 * A composable function that provides form submission handling with optional validation using a standardized schema.
 * It manages the submission state, handles form validation using a provided schema, 
 * and allows for custom error formatting and handling.
 * The function supports both synchronous and asynchronous submission handlers, 
 * and can be used with or without a validation schema.
 */
export interface SubmitRefs<TErrors> {
	form?: Ref<HTMLFormElement | undefined>
	submitting?: Ref<boolean>
	submitted?: Ref<boolean>
	errors?: Ref<TErrors | undefined>
}

export interface SubmitOptions<TErrors> extends SubmitRefs<TErrors> {
	input?: MaybeRefOrGetter<unknown>
	schema?: MaybeRefOrGetter<StandardSchemaV1>
	formatErrors?: ErrorsFormatter<TErrors>
	onErrors?: (errors: TErrors) => void | Promise<void>
}

export interface SubmitReturn<TArgs extends unknown[], TResult, TErrors> {
	form: Ref<HTMLFormElement | undefined>
	submit: (...args: TArgs) => Promise<TResult | undefined>
	submitting: Ref<boolean>
	submitted: Ref<boolean>
	errors: Ref<TErrors | undefined>
}

type SubmitFn<TArgs extends unknown[], TResult> =
	(...args: TArgs) => TResult | PromiseLike<TResult>

// ─── Overloads ────────────────────────────────────────────────────────────────

/** With schema — callback receives validated output as first arg. */
export function useSubmit<
	TSchema extends StandardSchemaV1,
	TArgs extends unknown[],
	TResult,
	TErrors = StandardErrors,
> (
	options: SubmitOptions<TErrors> & { schema: MaybeRefOrGetter<TSchema> },
	onSubmit: SubmitFn<[StandardSchemaV1.InferOutput<TSchema>, ...TArgs], TResult>,
): SubmitReturn<TArgs, TResult, TErrors>

/** Without schema — callback receives raw input (if provided) or just forwarded args. */
export function useSubmit<TArgs extends unknown[], TResult, TErrors = StandardErrors> (
	options ?: SubmitOptions<TErrors>,
	onSubmit ?: SubmitFn<TArgs, TResult>,
): SubmitReturn<TArgs, TResult, TErrors>

// ─── Implementation ──────────────────────────────────────────────────────────

export function useSubmit(
	options?: SubmitOptions<unknown>,
	onSubmit?: SubmitFn<unknown[], unknown>,
): SubmitReturn<unknown[], unknown, unknown> {
	const opts = options ?? {}
	const hasInput = opts.input !== undefined

	const form = opts.form ?? ref<HTMLFormElement>()
	const submitting = opts.submitting ?? ref(false)
	const submitted = opts.submitted ?? ref(false)
	const errors = opts.errors ?? ref()
	const formatErrors = opts.formatErrors ?? ((issues: StandardErrors) => issues)

	async function submit(...args: unknown[]) {
		if (submitting.value) return

		submitted.value = false
		errors.value = undefined

		if (form.value && !form.value.checkValidity()) {
			form.value.reportValidity()
			return
		}

		submitting.value = true
		try {
			const input = toValue(opts.input)
			const schema = toValue(opts.schema)

			if (schema) {
				const result = await schema['~standard'].validate(input)
				if (result.issues) {
					errors.value = formatErrors(result.issues)
					await opts.onErrors?.(errors.value)
					return
				}
				const returnValue = await onSubmit?.(result.value, ...args)
				if (errors.value) {
					await opts.onErrors?.(errors.value)
				} else {
					submitted.value = true
				}
				return returnValue
			}

			const returnValue = hasInput
				? await onSubmit?.(input, ...args)
				: await onSubmit?.(...args)

			if (errors.value) {
				await opts.onErrors?.(errors.value)
			} else {
				submitted.value = true
			}
			return returnValue
		} finally {
			submitting.value = false
		}
	}

	return { form, submit, submitting, submitted, errors }
}