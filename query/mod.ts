/**
 * @packageDocumentation
 * @module @jayobado/vue-toolkit/query
 * @description A collection of utilities for managing server state in Vue applications, inspired by React Query.
 */
export { useQuery } from './query.ts'
export type { QueryOptions, QueryReturn } from './query.ts'

export { useMutation } from './mutation.ts'
export type { MutationOptions, MutationReturn } from './mutation.ts'

export { invalidate, invalidatePrefix } from './cache.ts'
export type { CacheOptions } from './cache.ts'