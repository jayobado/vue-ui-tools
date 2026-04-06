import { ref, onScopeDispose, watch } from 'vue'
import type { Ref } from 'vue'

export interface LocalStorageReturn<T> {
	value: Ref<T>
	remove: () => void
	dispose: () => void
}

export function useLocalStorage<T>(
	key: string,
	initialValue: T,
): LocalStorageReturn<T> {
	function read(): T {
		try {
			const raw = localStorage.getItem(key)
			return raw !== null ? JSON.parse(raw) as T : initialValue
		} catch {
			return initialValue
		}
	}

	const value = ref(read()) as Ref<T>

	watch(value, (v) => {
		try {
			localStorage.setItem(key, JSON.stringify(v))
		} catch { /* quota exceeded or unavailable */ }
	}, { deep: true })

	function onStorage(e: StorageEvent): void {
		if (e.key !== key) return
		value.value = e.newValue !== null ? JSON.parse(e.newValue) as T : initialValue
	}

	globalThis.addEventListener('storage', onStorage)

	function remove(): void {
		localStorage.removeItem(key)
		value.value = initialValue
	}

	const dispose = () => {
		globalThis.removeEventListener('storage', onStorage)
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return { value, remove, dispose }
}