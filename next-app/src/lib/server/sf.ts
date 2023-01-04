import { error } from '@sveltejs/kit'
import type { Rpc, FetchArgs, SfResponse } from './types'

export async function sf<T>({name, args = [], cookie = ''}: Rpc): Promise<T> {
	const body = {
		id: Date.now(),
		method: name,
		params: {
			orderedParams: args,
		},
	}

	const results = await adapted_fetch({url: `${process.env.API_HOST}/api/sf`, method: 'POST', body, cookie})

	if (results.error) {
		console.log('lib/server/sf.ts.sf results.error: ', {results})
		throw error(500, results.error.message)
	}

	if (results.result === undefined) {
		console.log('lib/server/sf.ts.sf missing results.result: ', {results})
		throw error(500, 'Badly formed response, missing result')
	}

	return results.result
}

async function adapted_fetch({url, method, body, cookie = ''}: FetchArgs): Promise<SfResponse> {
	// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options
	const response: Response = await fetch(url, {
		method,
		headers: {
			'content-type': 'application/json',
			cookie,
		},
		body: JSON.stringify(body),
	}).catch(e => {
		// these only occur for network errors, like these:
		//	request made with a bad host, e.g., //httpbin
		//	the host is refusing connections
		console.log(`lib/server/sf.ts.adapted_fetch caught error on ${url}: `, {body}, {e})
		throw error(500, 'NETWORK ERROR with legacy app')
	})

	if (! response.ok) {
		console.log(`lib/server/sf.ts.adapted_fetch response !ok ${url}: `, {body}, await response.text())
		throw error(response.status, response.statusText)
	}

	return await response.json()
}
