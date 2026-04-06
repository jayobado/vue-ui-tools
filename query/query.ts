import { ref, toValue, watchEffect } from 'vue'
import type { MaybeRefOrGetter, Ref, WatchOptionsBase } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QueryOptions {
	enabled?: MaybeRefOrGetter<boolean>
	retry?: number
	retryDelay?: number
	onError?: (err: Error) => void
}

export interface QueryReturn<T> {
	data: Ref<T | undefined>
	error: Ref<Error | undefined>
	loading: Ref<boolean>
	refetch: () => Promise<void>
}

// ─── Implementation ──────────────────────────────────────────────────────────

export function useQuery<T>(
	fn: () => Promise<T>,
	options?: QueryOptions,
	watchOptions?: WatchOptionsBase,
): QueryReturn<T> {
	const data = ref<T>() as Ref<T | undefined>
	const error = ref<Error>()
	const loading = ref(false)

	const maxRetries = options?.retry ?? 0
	const retryDelay = options?.retryDelay ?? 1000

	let generation = 0

	async function execute(): Promise<void> {
		const current = ++generation
		error.value = undefined
		loading.value = true

		let attempt = 0
		while (true) {
			try {
				const result = await fn()
				if (current !== generation) return
				data.value = result
				error.value = undefined
				break
			} catch (err) {
				if (current !== generation) return
				const e = err instanceof Error ? err : new Error(String(err))
				if (attempt < maxRetries) {
					attempt++
					await new Promise(r => setTimeout(r, retryDelay))
					if (current !== generation) return
					continue
				}
				error.value = e
				options?.onError?.(e)
				break
			}
		}

		if (current === generation) {
			loading.value = false
		}
	}

	watchEffect(() => {
		const enabled = options?.enabled !== undefined
			? toValue(options.enabled)
			: true
		if (!enabled) return
		execute()
	}, watchOptions)

	return { data, error, loading, refetch: execute }
}