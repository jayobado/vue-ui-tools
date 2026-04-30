import { ref, onScopeDispose } from 'vue'
import type { Ref } from 'vue'

/**
 * A composable function that provides clipboard copy functionality with a reactive state to indicate when text has 
 * been copied.
 * 
 * It allows you to copy text to the clipboard and automatically resets the copied state after a specified delay.
 * 
 * The function also provides a dispose method to clean up any timers when the component is unmounted or the 
 * scope is disposed.
 * 
 * @param options - An optional object to configure the reset delay for the copied state.
 * @returns An object containing the copy function, a reactive reference indicating if text has been copied, 
 * and a dispose function.
 */

export interface ClipboardReturn {
	copy: (text: string) => Promise<void>
	copied: Ref<boolean>
	dispose: () => void
}

export function useClipboard(
	options?: { resetDelay?: number },
): ClipboardReturn {
	const resetDelay = options?.resetDelay ?? 2000
	const copied = ref(false)
	let timer: number | undefined

	async function copy(text: string): Promise<void> {
		try {
			await navigator.clipboard.writeText(text)
			copied.value = true
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => {
				copied.value = false
			}, resetDelay) as unknown as number
		} catch {
			copied.value = false
		}
	}

	const dispose = () => {
		if (timer) clearTimeout(timer)
		copied.value = false
	}

	try { onScopeDispose(dispose) } catch { /* standalone */ }
	return { copy, copied, dispose }
}