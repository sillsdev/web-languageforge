import { error as serverError } from '@sveltejs/kit'
import { browser } from '$app/environment'
import { writable } from 'svelte/store'

export const error = writable()

export function throwError(message = '', code = 0) {
	if (browser) throw set({ code, message })

	throw serverError(code, message)
}

export const dismiss = set

if (browser) {
	// https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror#window.addEventListenererror
	window.addEventListener('error', event => set(event.error))

	// https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
	window.onunhandledrejection = (event : PromiseRejectionEvent) => set(event.reason)
}

function set(someError = {}) {
  const code = someError.code || 0
  const message = someError.message || ''

  error.set({ code, message })

  return { code, message }
}
