import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'


/**
 * A composable function that provides pagination state management for a list of items.
 * 
 * It allows you to easily track the current page, page size, total number of items, and provides utility functions 
 * to navigate between pages and calculate pagination details like total pages and whether there are next or previous pages.
 * 
 * The function returns reactive references for the pagination state and computed properties for derived values.
 * @param options - An optional object to initialize the pagination state with default values for page, pageSize, and total.
 * @returns An object containing reactive references for pagination state and utility functions for navigation.
 */

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