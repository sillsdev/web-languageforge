import { throwError } from '$lib/error'

export async function CREATE(body, cookie) { return await customFetch('post', body, cookie) }

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options
async function customFetch(method, body, cookie) {
	let response = {}
	try {
		response = await fetch(`${process.env.API_HOST}/api/sf`, {
			method,
			// credentials: 'include', // ensures the response back from the api will be allowed to "set-cookie"
			headers: {
				'content-type': 'application/json',
				cookie,
			},
			body: JSON.stringify({ id: Date.now(), ...body }),
		})
	} catch (e) {
		// these only occur for network errors, like these:
		//	request made with a bad host, e.g., //httpbin
		//	the host is refusing connections
		throwError('NETWORK ERROR', 500)
	}

	const results = await response.json()

	if (results.error) {
		throwError(results.error.message, 500)
	}

	if (! results.result) {
		throwError('Badly formed response, missing result', 500)
	}

	return results.result
}
