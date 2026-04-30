import { ref, onScopeDispose, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * A composable function that provides a reactive interface to the browser's localStorage API.
 * 
 * It allows you to easily synchronize a reactive value with localStorage, automatically updating
 * the stored value whenever it changes and keeping the reactive value in sync with any changes to 
 * localStorage from other tabs or windows.
 * 
 * The function also provides methods to remove the stored value and to clean up event listeners 
 * when the component is unmounted or the scope is disposed.
 * 
 * @param key - The key under which the value will be stored in localStorage.
 * @param initialValue - The initial value to use if there is no existing value in localStorage for the given key.
 * @returns An object containing a reactive reference to the stored value, a method to remove the stored value, 
 * and a dispose method for cleanup.
 */
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