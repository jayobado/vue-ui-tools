import { ref, onScopeDispose } from 'vue'
import type { Ref } from 'vue'

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