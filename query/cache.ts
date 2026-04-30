import { ref, type Ref } from 'vue'


/** 
 * A simple in-memory cache implementation for asynchronous data fetching, designed to work with Vue's reactivity system.
 * 
 * The cache allows you to store the results of asynchronous operations (like API calls) 
 * and automatically manages their loading and error states. 
 * 
 * It supports features like stale data management, garbage collection of unused entries, and manual invalidation.
 * 
 * The main functions are:
 * - `getOrCreate`: Retrieves a cache entry for a given key or creates it if it doesn't exist, using a provided async function to fetch the data.
 * - `release`: Decrements the subscriber count for a cache entry and schedules it for garbage collection if there are no more subscribers.
 * - `invalidate`: Marks a cache entry as stale, causing it to be revalidated on the next access.
 * - `invalidatePrefix`: Invalidates all cache entries that match a given key prefix.
 */

interface CacheEntry<T = unknown> {
	data: Ref<T | undefined>
	error: Ref<Error | undefined>
	loading: Ref<boolean>
	promise: Promise<T> | null
	timestamp: number
	subscribers: number
}

const cache = new Map<string, CacheEntry>()

export interface CacheOptions {
	staleTime?: number
	gcTime?: number
}

function serializeKey(key: unknown[]): string {
	return JSON.stringify(key)
}

export function getOrCreate<T>(
	key: unknown[],
	fn: () => Promise<T>,
	options?: CacheOptions,
): CacheEntry<T> {
	const serialized = serializeKey(key)
	const staleTime = options?.staleTime ?? 0

	let entry = cache.get(serialized) as CacheEntry<T> | undefined

	if (entry) {
		entry.subscribers++
		const age = Date.now() - entry.timestamp
		if (age > staleTime && !entry.loading.value) {
			revalidate(entry, fn)
		}
		return entry
	}

	entry = {
		data: ref<T>() as Ref<T | undefined>,
		error: ref<Error>() as Ref<Error | undefined>,
		loading: ref(false),
		promise: null,
		timestamp: 0,
		subscribers: 1,
	}

	cache.set(serialized, entry as CacheEntry)
	revalidate(entry, fn)
	return entry
}

function revalidate<T>(entry: CacheEntry<T>, fn: () => Promise<T>): void {
	entry.loading.value = true
	entry.error.value = undefined

	const promise = fn()
	entry.promise = promise

	promise.then(result => {
		if (entry.promise !== promise) return
		entry.data.value = result
		entry.error.value = undefined
		entry.timestamp = Date.now()
	}).catch(err => {
		if (entry.promise !== promise) return
		entry.error.value = err instanceof Error ? err : new Error(String(err))
	}).finally(() => {
		if (entry.promise !== promise) return
		entry.loading.value = false
	})
}

export function release(key: unknown[], gcTime: number = 300_000): void {
	const serialized = serializeKey(key)
	const entry = cache.get(serialized)
	if (!entry) return
	entry.subscribers--
	if (entry.subscribers <= 0) {
		setTimeout(() => {
			if (entry.subscribers <= 0) cache.delete(serialized)
		}, gcTime)
	}
}

export function invalidate(key?: unknown[]): void {
	if (key) {
		const serialized = serializeKey(key)
		const entry = cache.get(serialized)
		if (entry) entry.timestamp = 0
	} else {
		for (const entry of cache.values()) entry.timestamp = 0
	}
}

export function invalidatePrefix(prefix: unknown[]): void {
	const serialized = serializeKey(prefix)
	const match = serialized.slice(0, -1)
	for (const [key, entry] of cache) {
		if (key.startsWith(match)) entry.timestamp = 0
	}
}