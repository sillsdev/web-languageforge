/** @type {import('@sveltejs/kit').RequestHandler} */
export async function put({ request }) {
	let response = await fetch('http://app/api/sf', { // TODO: parameterize app here.
        method: 'post',
        headers: {
            'content-type': 'application/json',
            cookie: request.headers.get('cookie'),
        },
        body: JSON.stringify({
            id: 1,
            method: 'session_getSessionData',
            params: {
                orderedParams:[],
            },
            version: '2.0',
        })
    })

    const { result: { userId } } = await response.json()
    const { new_password } = await request.json()

    response = await fetch('http://app/api/sf', { // TODO: parameterize app here.
        method: 'post',
        headers: {
            'content-type': 'application/json',
            cookie: request.headers.get('cookie'),
        },
        body: JSON.stringify({
            id: 1,
            method: 'change_password',
            params: {
                orderedParams:
                [
                    userId,
                    new_password,
                ],
            },
            version: '2.0',
        })
    })

    return {
        body: { userId }//await response.json()
	};
}
