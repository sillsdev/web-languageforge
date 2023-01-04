import { throw_error } from '$lib/error'
import { start, stop } from '$lib/progress'
import type { AdaptedFetchArgs, FetchArgs } from './types'

export async function CREATE({url, body}: FetchArgs) { return await adapted_fetch({method: 'POST'  , url, body}) }
export async function GET   ({url      }: FetchArgs) { return await adapted_fetch({method: 'GET'   , url      }) }
export async function UPDATE({url, body}: FetchArgs) { return await adapted_fetch({method: 'PUT'   , url, body}) }
export async function DELETE({url      }: FetchArgs) { return await adapted_fetch({method: 'DELETE', url      }) }

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options
async function adapted_fetch({method, url, body}: AdaptedFetchArgs) {
	start(url)

	const response: Response = await fetch(url, {
		method,
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(body),
	}).catch(throw_error) // these only occur for network errors, like these:
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
