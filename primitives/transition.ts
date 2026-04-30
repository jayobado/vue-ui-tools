/***
 * A utility module for handling CSS transitions in Vue.js applications. 
 * It provides functions to manage the entering and leaving of elements with specified transition classes. 
 * The `enter` function applies the appropriate classes for the entering transition, 
 * while the `leave` function does the same for the leaving transition. Both functions return a promise that resolves 
 * when the transition is complete, allowing for asynchronous handling of transitions in Vue components.
 * 
 * @interface TransitionClasses
 * @function enter
 * @function leave
 * @param el - The HTML element to which the transition classes will be applied.
 * @param classes - An object containing the CSS classes for the transition states (entering and leaving).
 * @returns A promise that resolves when the transition is complete.
 */

export interface TransitionClasses {
	enterFrom?: string
	enterActive?: string
	enterTo?: string
	leaveFrom?: string
	leaveActive?: string
	leaveTo?: string
}

export function enter(el: HTMLElement, classes: TransitionClasses): Promise<void> {
	return new Promise(resolve => {
		const { enterFrom, enterActive, enterTo } = classes
		if (enterFrom) el.classList.add(enterFrom)
		if (enterActive) el.classList.add(enterActive)

		el.offsetHeight // force reflow

		requestAnimationFrame(() => {
			if (enterFrom) el.classList.remove(enterFrom)
			if (enterTo) el.classList.add(enterTo)

			function onEnd(): void {
				if (enterActive) el.classList.remove(enterActive)
				if (enterTo) el.classList.remove(enterTo)
				el.removeEventListener('transitionend', onEnd)
				el.removeEventListener('animationend', onEnd)
				resolve()
			}

			el.addEventListener('transitionend', onEnd, { once: true })
			el.addEventListener('animationend', onEnd, { once: true })

			if (getComputedStyle(el).transitionDuration === '0s' &&
				getComputedStyle(el).animationDuration === '0s') {
				onEnd()
			}
		})
	})
}

export function leave(el: HTMLElement, classes: TransitionClasses): Promise<void> {
	return new Promise(resolve => {
		const { leaveFrom, leaveActive, leaveTo } = classes
		if (leaveFrom) el.classList.add(leaveFrom)
		if (leaveActive) el.classList.add(leaveActive)

		el.offsetHeight // force reflow

		requestAnimationFrame(() => {
			if (leaveFrom) el.classList.remove(leaveFrom)
			if (leaveTo) el.classList.add(leaveTo)

			function onEnd(): void {
				if (leaveActive) el.classList.remove(leaveActive)
				if (leaveTo) el.classList.remove(leaveTo)
				el.removeEventListener('transitionend', onEnd)
				el.removeEventListener('animationend', onEnd)
				resolve()
			}

			el.addEventListener('transitionend', onEnd, { once: true })
			el.addEventListener('animationend', onEnd, { once: true })

			if (getComputedStyle(el).transitionDuration === '0s' &&
				getComputedStyle(el).animationDuration === '0s') {
				onEnd()
			}
		})
	})
}