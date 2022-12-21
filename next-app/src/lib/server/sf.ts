import { error } from '@sveltejs/kit'

type Rpc = {
	name: string,
	args?: string[] | object[],
	cookie?: string,
}
export async function sf({ name, args = [], cookie }: Rpc) {
	const body = {
		id: Date.now(),
		method: name,
		params: {
			orderedParams: args,
		},
	}

	const results = await custom_fetch(`${process.env.API_HOST}/api/sf`, 'post', body, cookie)

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

async function custom_fetch(url, method, body, cookie) {
	const bodyAsJSON = JSON.stringify(body)

	// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options
	const response: Response = await fetch(url, {
		method,
		headers: {
			'content-type': 'application/json',
			cookie,
		},
		body: bodyAsJSON,
	}).catch(e => {
		// these only occur for network errors, like these:
		//	request made with a bad host, e.g., //httpbin
		//	the host is refusing connections
		console.log(`lib/server/sf.ts.custom_fetch caught error on ${url}=>${bodyAsJSON}: `, {e})
		throw error(500, 'NETWORK ERROR with legacy app')
	})

	if (! response.ok) {
		console.log(`lib/server/sf.ts.custom_fetch response !ok ${url}=>${bodyAsJSON}: `, await response.text())
		throw error(response.status, response.statusText)
	}

	return await response.json()
}
