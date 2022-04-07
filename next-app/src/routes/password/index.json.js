import { throwError } from '$lib/error'
import { CREATE } from '$lib/fetch/server'

/** @type {import('./index.json').RequestHandler} */
export async function put({ request }) {
	try {
		const { password, password_confirm } = await request.json()

		if (! password) {
			throwError('Password is required', 400)
		}
		if (password !== password_confirm) {
			throwError('Passwords do not match', 400)
		}

		const { userId } = await CREATE({
				method: 'session_getSessionData',
				params: {
					orderedParams:[],
				},
			},
			request.headers.get('cookie'),
		)

		if (! userId) {
			throwError('User unknown', 404)
		}

		await CREATE({
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

    return {}
}
