/** @type {import('@sveltejs/kit').RequestHandler} */
export async function put({ request }) {
    let response = await fetch(`${process.env.API_HOST}/api/sf`, {
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
        }),
    })

    const { result: { userId } } = await response.json()
    const { new_password } = await request.json()

    response = await fetch(`${process.env.API_HOST}/api/sf`, {
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
        }),
    })

    return {
        body: { userId },
	};
}
