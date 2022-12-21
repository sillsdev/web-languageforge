import { browser } from '$app/environment'
import { writable, type Writable } from 'svelte/store'

type LfError = {
	message: string,
	code?: number,
}
export const error: Writable<LfError> = writable({ message: '' })

export function throw_error(message: string, code: number = 0) {
	throw set({ message, code })
}

export const dismiss = () => set({ message: '' })

if (browser) {
	// https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror#window.addEventListenererror
	window.addEventListener('error', (event: ErrorEvent) => set(event.error))

	// https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
	window.onunhandledrejection = (event: PromiseRejectionEvent) => set(event.reason)
}

function set({ message, code = 0 }: LfError) {
  error.set({ code, message })

  return { code, message }
}
