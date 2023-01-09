import { browser } from '$app/environment'
import { writable, type Writable } from 'svelte/store'

export const error: Writable<Error> = writable(Error())

export const dismiss = () => error.set(Error())

if (browser) {
	// https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror#window.addEventListenererror
	window.addEventListener('error', (event: ErrorEvent) => error.set(event.error))

	// https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
	window.onunhandledrejection = (event: PromiseRejectionEvent) => error.set(event.reason)
}
