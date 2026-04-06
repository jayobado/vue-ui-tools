import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface PaginationOptions {
	page?: number
	pageSize?: number
	total?: number
}

export interface PaginationReturn {
	page: Ref<number>
	pageSize: Ref<number>
	total: Ref<number>
	totalPages: ComputedRef<number>
	hasNext: ComputedRef<boolean>
	hasPrev: ComputedRef<boolean>
	next: () => void
	prev: () => void
	goTo: (page: number) => void
	reset: () => void
}

export function usePagination(options?: PaginationOptions): PaginationReturn {
	const initialPage = options?.page ?? 1
	const page = ref(initialPage)
	const pageSize = ref(options?.pageSize ?? 10)
	const total = ref(options?.total ?? 0)

	const totalPages = computed(() => {
		return pageSize.value > 0 ? Math.ceil(total.value / pageSize.value) : 0
	})

	const hasNext = computed(() => page.value < totalPages.value)
	const hasPrev = computed(() => page.value > 1)

	function next(): void {
		if (hasNext.value) page.value++
	}

	function prev(): void {
		if (hasPrev.value) page.value--
	}

	function goTo(p: number): void {
		const clamped = Math.max(1, Math.min(p, totalPages.value || 1))
		page.value = clamped
	}

	function reset(): void {
		page.value = initialPage
	}

	return { page, pageSize, total, totalPages, hasNext, hasPrev, next, prev, goTo, reset }
}