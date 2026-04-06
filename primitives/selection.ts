import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface SelectionReturn<T> {
	selected: Ref<Set<T>>
	isSelected: (item: T) => boolean
	toggle: (item: T) => void
	select: (item: T) => void
	deselect: (item: T) => void
	selectAll: (items: T[]) => void
	clear: () => void
	count: ComputedRef<number>
	toArray: () => T[]
}

export function useSelection<T>(): SelectionReturn<T> {
	const selected = ref(new Set<T>()) as Ref<Set<T>>

	const count = computed(() => selected.value.size)

	function isSelected(item: T): boolean {
		return selected.value.has(item)
	}

	function toggle(item: T): void {
		const next = new Set(selected.value)
		if (next.has(item)) {
			next.delete(item)
		} else {
			next.add(item)
		}
		selected.value = next
	}

	function select(item: T): void {
		if (isSelected(item)) return
		const next = new Set(selected.value)
		next.add(item)
		selected.value = next
	}

	function deselect(item: T): void {
		if (!isSelected(item)) return
		const next = new Set(selected.value)
		next.delete(item)
		selected.value = next
	}

	function selectAll(items: T[]): void {
		selected.value = new Set(items)
	}

	function clear(): void {
		selected.value = new Set()
	}

	function toArray(): T[] {
		return Array.from(selected.value)
	}

	return { selected, isSelected, toggle, select, deselect, selectAll, clear, count, toArray }
}