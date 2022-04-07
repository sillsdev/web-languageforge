import { throwError } from '$lib/error'
import { start, stop } from '$lib/progress'
// import t from '../i18n'

export async function CREATE(url, body) { return await customFetch('post'  , url, body) }
export async function GET   (url      ) { return await customFetch('get'   , url      ) }
export async function UPDATE(url, body) { return await customFetch('put'   , url, body) }
export async function DELETE(url      ) { return await customFetch('delete', url      ) }

// https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
export const upload = async formData => await CREATE('post', formData)

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options
async function customFetch(method, url, body) {
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

	let response = {}
	try {
		start(url)

		response = await fetch(url, {
			method,
			// credentials: 'include', // ensures the response back from the api will be allowed to "set-cookie"
			headers,
			body,
		})
	} catch (e) {
		// these only occur for network errors, like these:
		//	request made with a bad host, e.g., //httpbin
		//	the host is refusing connections
		//	client is offline, i.e., airplane mode or something
		//	CORS preflight failures
		throwError(e)
	} finally {
		stop(url)
	}

	const result = await response.json()

	// reminder: fetch does not throw exceptions for non-200 responses (https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
	if (! response.ok) {
		const code = response.status
		const message = result.message || response.statusText

		throwError(message, code)
	}

	return result
}
