import { throw_error } from '$lib/error'
import { start, stop } from '$lib/progress'

export async function CREATE(url, body) { return await custom_fetch('post'  , url, body) }
export async function GET   (url      ) { return await custom_fetch('get'   , url      ) }
export async function UPDATE(url, body) { return await custom_fetch('put'   , url, body) }
export async function DELETE(url      ) { return await custom_fetch('delete', url      ) }

// https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
// export const upload = async formData => await CREATE('post', formData)

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options
async function custom_fetch(method, url, body) {
	const headers = {
		'content-type': 'application/json',
	}

	// when dealing with FormData, i.e., when uploading files, allow the browser to set the request up
	// so boundary information is built properly.
	if (body instanceof FormData) {
		delete headers['content-type']
	} else {
		body = JSON.stringify(body)
	}

	start(url)
	const response = await fetch(url, {
		method,
		headers,
		body,
	})
	.catch (throw_error) // these only occur for network errors, like these:
						//	  * request made with a bad host, e.g., //httpbin
						//	  * the host is refusing connections
						//	  * client is offline, i.e., airplane mode or something
						//	  * CORS preflight failures
	.finally(() => stop(url))

	// reminder: fetch does not throw exceptions for non-200 responses (https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
	if (! response.ok) {
		const results = await response.json().catch(() => {}) || {}

		const message = results.message || response.statusText

		throw_error(message, response.status)
	}

	return await response.json()
}
