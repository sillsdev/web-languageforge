import { page } from '$app/stores'
import { throwError } from '$lib/error'
import { sf } from '$lib/fetch/server'

// TODO: spin things up locally and build some data for use on the activity page.
// TODO: then dump it into a file and see if it can be reloaded
// TODO: if that works, that will help with development
// TODO: next, build out the api to simply convert the activity into an array
// TODO: next, start to peel off the individual properties
// username | new | updated entries | updated fields | [details](/projects/activity/{id})
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