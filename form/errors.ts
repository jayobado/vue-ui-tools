import type { StandardSchemaV1 } from '@standard-schema/spec'

/**
 * This module provides types and a utility function for handling validation errors in a standardized format.
 * It defines a `StandardErrors` type that represents an array of validation issues, and an `ErrorsFormatter` type 
 * that describes a function for formatting these issues into a custom structure.
 * 
 * The `FlatErrors` interface represents a flattened structure of errors, where root-level errors are stored in a `root` array, and nested errors are stored in a `nested` object with dot-separated paths as keys.
 * 
 * The `flatten` function takes an array of validation issues and transforms it into the `FlatErrors` structure, making it easier to access and display error messages in a user-friendly way.
 * 
 * @type StandardErrors
 * @type ErrorsFormatter
 * @interface FlatErrors
 * @function flatten
 * @param issues - An array of validation issues to be flattened.
 * @returns A `FlatErrors` object containing the flattened error messages.
 */

export type StandardErrors = readonly StandardSchemaV1.Issue[]

export type ErrorsFormatter<T> = (issues: StandardErrors) => T

export interface FlatErrors {
	root?: string[]
	nested?: Partial<Record<string, string[]>>
}

export function flatten(issues: StandardErrors): FlatErrors {
	const errors: FlatErrors = {}
	for (const issue of issues) {
		const dotPath = issue.path
			?.map(p => typeof p === 'object' ? p.key : p)
			.join('.')
		if (dotPath) {
			errors.nested ??= {}
			errors.nested[dotPath] ??= []
			errors.nested[dotPath]!.push(issue.message)
		} else {
			errors.root ??= []
			errors.root.push(issue.message)
		}
	}
	return errors
}