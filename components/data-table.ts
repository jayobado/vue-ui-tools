import { createVNode, type VNode, type VNodeArrayChildren } from 'vue'


/**
 * 
 * An interface representing a column in the data table. Each column has a key that corresponds to a property in the row data,
 * a header that is displayed in the table header, and an optional render function that defines how to render the cell content for that column. 
 * The column can also have optional classes for the header and cells.
 * 
 * @interface Column
 * @template T - The type of the row data. This allows the render function to have type information about the row.
 * @property {string} key - The key that corresponds to a property in the row data. This is used to access the value for this column in each row.
 * @property {string} header - The text to be displayed in the table header for this column.
 * @property {(row: T, index: number) => VNode | string} [render] - An optional function that defines how to render the cell content for this column. It receives the row data and index as arguments and returns a VNode or string to be rendered in the cell.
 * @property {string} [headerClass] - An optional class to be applied to the header cell for this column.
 * @property {string} [cellClass] - An optional class to be applied to the cells for this column.
 */
export interface Column<T> {
	key: string
	header: string
	render?: (row: T, index: number) => VNode | string
	headerClass?: string
	cellClass?: string
}

/***
 * An interface representing the props for the data table component. 
 * It includes an array of columns, an array of rows, and various optional customization options.
 * 
 * @interface DataTableProps
 * @template T - The type of the row data. This allows the component to have type information about the rows.
 * @property {Column<T>[]} columns - An array of columns that define the structure of the table.
 * @property {T[]} rows - An array of rows that contain the data to be displayed in the table.
 * @property {string} [class] - An optional class to be applied to the table element.
 */
export interface DataTableProps<T> {
	columns: Column<T>[]
	rows: T[]
	class?: string
	headerClass?: string
	rowClass?: string | ((row: T, index: number) => string)
	emptyText?: string
	rowKey?: (row: T, index: number) => string | number
	onRowClick?: (row: T, index: number) => void
}

/**
 * A functional component that renders a data table based on the provided props.
 * 
 * @param props 
 * @returns 
 */

export function dataTable<T extends Record<string, unknown>>(
	props: DataTableProps<T>,
): VNode {
	const { columns, rows, emptyText = 'No data' } = props

	const headerCells: VNodeArrayChildren = columns.map(col => {
		return createVNode('th', {
			class: col.headerClass || undefined,
		}, col.header)
	})

	const thead = createVNode('thead', null, [
		createVNode('tr', {
			class: props.headerClass || undefined,
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
				const content = col.render
					? col.render(row, index)
					: String(row[col.key] ?? '')
				return createVNode('td', {
					class: col.cellClass || undefined,
				}, typeof content === 'string' ? content : [content])
			})

			const rowClass = typeof props.rowClass === 'function'
				? props.rowClass(row, index)
				: props.rowClass

			return createVNode('tr', {
				key: props.rowKey ? props.rowKey(row, index) : index,
				class: rowClass || undefined,
				onClick: props.onRowClick ? () => props.onRowClick!(row, index) : undefined,
				style: props.onRowClick ? 'cursor: pointer' : undefined,
			}, cells)
		})
	}

	const tbody = createVNode('tbody', null, bodyContent)

	return createVNode('table', {
		class: props.class || undefined,
	}, [thead, tbody])
}