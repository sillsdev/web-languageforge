import { page } from '$app/stores'
import { throwError } from '$lib/error'
import { sf } from '$lib/fetch/server'

// TODO: next, build out the api to simply convert the activity into an array
// TODO: next, start to peel off the individual properties
export async function get({ params, request }) {
	const project = {
		id: params.project_id,
	}

	const activities = [
		{
			id: 1,
			username: 'johndoe',
		},
		{
			id: 2,
			username: 'janedoe',
		},
	]

	try {
		// const { password, password_confirm } = await request.json()

		// if (! password) {
		// 	throwError('Password is required', 400)
		// }
		// if (password !== password_confirm) {
		// 	throwError('Passwords do not match', 400)
		// }

		// const cookie = request.headers.get('cookie')

		// const { userId } = await sf({
		// 	name: 'session_getSessionData',
		// 	cookie,
		// })

		// if (! userId) {
		// 	throwError('User unknown', 404)
		// }

		// await sf({
		// 	name: 'change_password',
		// 	args: [userId, password],
		// 	cookie,
		// })
	} catch (error) {
		return {
			status: error.code,
			body: error,
		}
	}

	return {
		body: {
			project,
			activities,
		},
	}
}
