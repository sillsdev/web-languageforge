import { throwError } from '$lib/error'
import { CREATE } from '$lib/fetch/server'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function put({ request }) {
	try {
		const { password, password_confirm } = await request.json()

		if (!password) {
			throwError('Password is required', 400)
		}
		if (password !== password_confirm) {
			throwError('Passwords do not match', 400)
		}

		const { result: { userId } } = await CREATE({
				id: 1, //TODO: what's the significance of this?
				method: 'session_getSessionData',
				params: {
					orderedParams:[],
				},
			},
			request.headers.get('cookie'),
		)

		await CREATE({
				id: 1, //TODO: what's the significance of this?
				method: 'change_password',
				params: {
					orderedParams:
					[
						userId,
						password,
					],
				},
			},
			request.headers.get('cookie'),
		)
	} catch (error) {
		return {
			status: error.code,
			body: error,
		}

	}

    return {
        body: { userId },
	}
}
