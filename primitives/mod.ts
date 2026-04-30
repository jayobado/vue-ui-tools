/**
 * @packageDocumentation
 * @module @jayobado/vue-toolkit/primitives
 * @description A collection of low-level utilities and primitives for building Vue applications.
 */

export { createPortal } from './portal.ts'

export { useClickOutside } from './click-outside.ts'
export { useEscapeKey } from './escape-key.ts'
export { useFocusTrap } from './focus-trap.ts'
export { useScrollLock } from './scroll-lock.ts'

export { enter, leave } from './transition.ts'
export type { TransitionClasses } from './transition.ts'

export { computePosition } from './position.ts'
export type { Placement, PositionOptions } from './position.ts'

export { useMediaQuery } from './media-query.ts'
export type { MediaQueryReturn } from './media-query.ts'

export { useLocalStorage } from './local-storage.ts'
export type { LocalStorageReturn } from './local-storage.ts'

export { useDebounce, useDebounceFn } from './debounce.ts'
export type { DebounceValueReturn } from './debounce.ts'

export { useInterval } from './interval.ts'
export type { IntervalReturn } from './interval.ts'

export { useEventListener } from './event-listener.ts'

export { usePagination } from './pagination.ts'
export type { PaginationOptions, PaginationReturn } from './pagination.ts'

export { useSelection } from './selection.ts'
export type { SelectionReturn } from './selection.ts'

export { useClipboard } from './clipboard.ts'
export type { ClipboardReturn } from './clipboard.ts'