import { browser } from '$app/env'
import { writable } from 'svelte/store'

export const error = writable({})
export const throwError = (message = '', code = 0) => { throw set({ code, message }) }
export const dismiss = () => set({})

if (browser) {
	// https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror#window.addEventListenererror
	window.addEventListener('error', event => set(event.error))

	// https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
	window.onunhandledrejection = (event : PromiseRejectionEvent) => set(event.reason)
}

function set(someError) {
  const code = someError.code || 0

  let message = ''
  if (typeof someError === 'object') {
    message = someError.message === undefined ? '' : someError.message
  }

  error.set({ code, message })

  return { code, message }
}
