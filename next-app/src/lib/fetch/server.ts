import { throwError } from '$lib/error'

interface Rpc {
	name: string,
	args?: string[],
	cookie?: string,
}
export async function sf(rpc: Rpc) {
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
		console.log('fetch/server.ts.sf missing results.result: ', {results})
		throwError('Badly formed response, missing result', 500)
	}

	return results.result
}

async function customFetch(url, method, body, cookie) {
	const bodyAsJsonString = JSON.stringify(body)

	// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options
	const response = await fetch(url, {
		method,
		headers: {
			'content-type': 'application/json',
			cookie,
		},
		body: bodyAsJsonString,
	}).catch(e => {
		// these only occur for network errors, like these:
		//	request made with a bad host, e.g., //httpbin
		//	the host is refusing connections
		console.log(`fetch/server.ts.customFetch caught error on ${url}=>${bodyAsJsonString}: `, e)
		throwError('NETWORK ERROR', 500)
	})

	if (! response.ok) {
		console.log('fetch/server.ts.customFetch response !ok: ', await response.text())
		throwError(response.statusText, response.status)
	}

	return await response.json()
}
