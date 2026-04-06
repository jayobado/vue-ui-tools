import { createVNode, type VNode, type VNodeArrayChildren } from 'vue'
import { css } from '../css.ts'
import type { StyleObject } from '../css.ts'

export interface Column<T> {
	key: string
	header: string
	render?: (row: T, index: number) => VNode | string
	headerStyles?: StyleObject
	cellStyles?: StyleObject
}

export interface DataTableProps<T> {
	columns: Column<T>[]
	rows: T[]
	class?: string
	styles?: StyleObject
	headerStyles?: StyleObject
	rowStyles?: StyleObject | ((row: T, index: number) => StyleObject)
	emptyText?: string
	rowKey?: (row: T, index: number) => string | number
	onRowClick?: (row: T, index: number) => void
}

export function DataTable<T extends Record<string, unknown>>(
	props: DataTableProps<T>,
): VNode {
	const { columns, rows, emptyText = 'No data' } = props

	const tableClasses: string[] = []
	if (props.class) tableClasses.push(props.class)
	if (props.styles) tableClasses.push(css(props.styles))

	const headerCells: VNodeArrayChildren = columns.map(col => {
		const classes: string[] = []
		if (col.headerStyles) classes.push(css(col.headerStyles))
		return createVNode('th', {
			class: classes.join(' ') || undefined,
		}, col.header)
	})

	const headerRowClasses: string[] = []
	if (props.headerStyles) headerRowClasses.push(css(props.headerStyles))

	const thead = createVNode('thead', null, [
		createVNode('tr', {
			class: headerRowClasses.join(' ') || undefined,
		}, headerCells),
	])

	let bodyContent: VNodeArrayChildren

	if (rows.length === 0) {
		bodyContent = [
			createVNode('tr', null, [
				createVNode('td', { colSpan: columns.length }, emptyText),
			]),
		]
	} else {
		bodyContent = rows.map((row, index) => {
			const cells: VNodeArrayChildren = columns.map(col => {
				const classes: string[] = []
				if (col.cellStyles) classes.push(css(col.cellStyles))
				const content = col.render
					? col.render(row, index)
					: String(row[col.key] ?? '')
				return createVNode('td', {
					class: classes.join(' ') || undefined,
				}, typeof content === 'string' ? content : [content])
			})

			const rowClasses: string[] = []
			if (props.rowStyles) {
				const s = typeof props.rowStyles === 'function'
					? props.rowStyles(row, index)
					: props.rowStyles
				rowClasses.push(css(s))
			}

			return createVNode('tr', {
				key: props.rowKey ? props.rowKey(row, index) : index,
				class: rowClasses.join(' ') || undefined,
				onClick: props.onRowClick ? () => props.onRowClick!(row, index) : undefined,
				style: props.onRowClick ? 'cursor: pointer' : undefined,
			}, cells)
		})
	}

	const tbody = createVNode('tbody', null, bodyContent)

	return createVNode('table', {
		class: tableClasses.join(' ') || undefined,
	}, [thead, tbody])
}