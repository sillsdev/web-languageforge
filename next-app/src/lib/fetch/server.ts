import { throwError } from '$lib/error'

/**
 *
 * @typedef RPC
 * @type {object}
 * @property {string} name Name of the remote procedure to call
 * @property {string[]} [args] Arguments to pass to the remote procedure
 * @property {string} [cookie] https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 *
 * @param { RPC } rpc
 */
export async function sf(rpc) {
	const { name, args = [], cookie } = rpc

	const body = {
		id: Date.now(),
		method: name,
		params: {
			orderedParams: args,
		},
	}

	const results = await customFetch(`${process.env.API_HOST}/api/sf`, 'post', body, cookie)

	if (results.error) {
		throwError(results.error.message, 500)
	}

	if (results.result === undefined) {
		throwError('Badly formed response, missing result', 500)
	}

	return results.result
}

async function customFetch(url, method, body, cookie) {
	let response = {}

	try {
		// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options
		response = await fetch(url, {
			method,
			// credentials: 'include', // ensures the response back from the api will be allowed to "set-cookie"
			headers: {
				'content-type': 'application/json',
				cookie,
			},
			body: JSON.stringify(body),
		})
	} catch {
		// these only occur for network errors, like these:
		//	request made with a bad host, e.g., //httpbin
		//	the host is refusing connections
		throwError('NETWORK ERROR', 500)
	}

	if (! response.ok) {
		throwError(response.statusText, response.status)
	}

	return await response.json()
}
