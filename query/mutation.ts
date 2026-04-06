import { ref } from 'vue'
import type { Ref } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MutationOptions<TResult> {
	retry?: number
	retryDelay?: number
	onSuccess?: (result: TResult) => void | Promise<void>
	onError?: (err: Error) => void | Promise<void>
	onSettled?: () => void | Promise<void>
}

export interface MutationReturn<TArgs extends unknown[], TResult> {
	mutate: (...args: TArgs) => Promise<TResult | undefined>
	data: Ref<TResult | undefined>
	error: Ref<Error | undefined>
	loading: Ref<boolean>
	reset: () => void
}

// ─── Implementation ──────────────────────────────────────────────────────────

export function useMutation<TArgs extends unknown[], TResult>(
	fn: (...args: TArgs) => Promise<TResult>,
	options?: MutationOptions<TResult>,
): MutationReturn<TArgs, TResult> {
	const data = ref<TResult>() as Ref<TResult | undefined>
	const error = ref<Error>() as Ref<Error | undefined>
	const loading = ref(false)

	const maxRetries = options?.retry ?? 0
	const retryDelay = options?.retryDelay ?? 1000

	async function mutate(...args: TArgs): Promise<TResult | undefined> {
		if (loading.value) return

		error.value = undefined
		loading.value = true

		let attempt = 0
		try {
			while (true) {
				try {
					const result = await fn(...args)
					data.value = result
					error.value = undefined
					await options?.onSuccess?.(result)
					return result
				} catch (err) {
					const e = err instanceof Error ? err : new Error(String(err))
					if (attempt < maxRetries) {
						attempt++
						await new Promise(r => setTimeout(r, retryDelay))
						continue
					}
					error.value = e
					await options?.onError?.(e)
					return undefined
				}
			}
		} finally {
			loading.value = false
			await options?.onSettled?.()
		}
	}

	function reset(): void {
		data.value = undefined
		error.value = undefined
		loading.value = false
	}

	return { mutate, data, error, loading, reset }
}