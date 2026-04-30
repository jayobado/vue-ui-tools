import { ref, toValue, watchEffect, onScopeDispose } from 'vue'
import type { MaybeRefOrGetter, Ref, WatchOptionsBase } from 'vue'
import { getOrCreate, release, invalidate as invalidateCache } from './cache.ts'
import type { CacheOptions } from './cache.ts'

/**
 * A composable function that provides data fetching capabilities with support for caching, retries, and reactive query keys.
 * 
 * It allows you to define a query function that fetches data, along with options for caching the results based on a key,
 * controlling when the query is enabled, and handling errors with optional retry logic.
 * 
 * The function returns reactive references for the query data, loading state, and any errors, 
 * as well as methods to refetch and invalidate the cache.
 * 
 * @interface QueryOptions
 * @interface QueryReturn
 * @function useQuery
 * @param fn - An asynchronous function that fetches the data for the query.
 * @param options - An object containing configuration options for caching, retries, and query behavior.
 * 
 * @param watchOptions - Optional Vue watch options to control the behavior of the reactive effect that 
 * manages the query execution.
 * 
 * @returns An object containing reactive references to the query data, loading state, error state, 
 * and methods for refetching and invalidating the cache.
 */

export interface QueryOptions extends CacheOptions {
	key?: MaybeRefOrGetter<unknown[]>
	enabled?: MaybeRefOrGetter<boolean>
	retry?: number
	retryDelay?: number
	onError?: (err: Error) => void
}

export interface QueryReturn<T> {
	data: Ref<T | undefined>
	error: Ref<Error | undefined>
	loading: Ref<boolean>
	refetch: () => void | Promise<void>
	invalidate: () => void
}

// ─── Retry wrapper ───────────────────────────────────────────────────────────

function wrapWithRetry<T>(
	fn: () => Promise<T>,
	opts: { retry?: number; retryDelay?: number; onError?: (err: Error) => void },
): () => Promise<T> {
	const maxRetries = opts.retry ?? 0
	const retryDelay = opts.retryDelay ?? 1000

	return async () => {
		let attempt = 0
		while (true) {
			try {
				return await fn()
			} catch (err) {
				const e = err instanceof Error ? err : new Error(String(err))
				if (attempt < maxRetries) {
					attempt++
					await new Promise(r => setTimeout(r, retryDelay))
					continue
				}
				opts.onError?.(e)
				throw e
			}
		}
	}
}

// ─── Uncached query (no key provided) ────────────────────────────────────────

function useUncachedQuery<T>(
	fn: () => Promise<T>,
	opts: QueryOptions,
	watchOptions?: WatchOptionsBase,
): QueryReturn<T> {
	const data = ref<T>() as Ref<T | undefined>
	const error = ref<Error>() as Ref<Error | undefined>
	const loading = ref(false)

	let generation = 0

	async function execute(): Promise<void> {
		const current = ++generation
		error.value = undefined
		loading.value = true

		const wrapped = wrapWithRetry(fn, opts)
		try {
			const result = await wrapped()
			if (current !== generation) return
			data.value = result
			error.value = undefined
		} catch (err) {
			if (current !== generation) return
			error.value = err instanceof Error ? err : new Error(String(err))
		}

		if (current === generation) loading.value = false
	}

	watchEffect(() => {
		const enabled = opts.enabled !== undefined ? toValue(opts.enabled) : true
		if (!enabled) return
		execute()
	}, watchOptions)

	return {
		data, error, loading,
		refetch: execute,
		invalidate: () => { },
	}
}

// ─── Cached query (key provided) ─────────────────────────────────────────────

function useCachedQuery<T>(
	fn: () => Promise<T>,
	opts: QueryOptions & { key: MaybeRefOrGetter<unknown[]> },
	watchOptions?: WatchOptionsBase,
): QueryReturn<T> {
	const data = ref<T>() as Ref<T | undefined>
	const error = ref<Error>() as Ref<Error | undefined>
	const loading = ref(false)

	let currentKey: string | null = null
	let stopSync: (() => void) | undefined

	function bind(key: unknown[]): () => void {
		if (currentKey !== null) {
			release(JSON.parse(currentKey), opts.gcTime)
		}

		const entry = getOrCreate<T>(key, wrapWithRetry(fn, opts), opts)
		currentKey = JSON.stringify(key)

		const stop = watchEffect(() => {
			data.value = entry.data.value
			error.value = entry.error.value
			loading.value = entry.loading.value
		})

		return stop
	}

	watchEffect(() => {
		const enabled = opts.enabled !== undefined ? toValue(opts.enabled) : true
		if (!enabled) return

		const key = toValue(opts.key)
		stopSync?.()
		stopSync = bind(key)
	}, watchOptions)

	try {
		onScopeDispose(() => {
			stopSync?.()
			if (currentKey !== null) {
				release(JSON.parse(currentKey), opts.gcTime)
			}
		})
	} catch { /* standalone */ }

	function refetch(): void {
		if (currentKey === null) return
		const key = JSON.parse(currentKey)
		invalidateCache(key)
		stopSync?.()
		stopSync = bind(key)
	}

	function invalidate(): void {
		if (currentKey === null) return
		invalidateCache(JSON.parse(currentKey))
	}

	return { data, error, loading, refetch, invalidate }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function useQuery<T>(
	fn: () => Promise<T>,
	options?: QueryOptions,
	watchOptions?: WatchOptionsBase,
): QueryReturn<T> {
	const opts = options ?? {}

	if (opts.key !== undefined) {
		return useCachedQuery(fn, opts as QueryOptions & { key: MaybeRefOrGetter<unknown[]> }, watchOptions)
	}

	return useUncachedQuery(fn, opts, watchOptions)
}