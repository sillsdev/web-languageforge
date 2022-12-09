import { json } from '@sveltejs/kit'
import { fetch_current_user } from '$lib/data/user'
import { throwError } from '$lib/error'
import { sf } from '$lib/fetch/server'

export async function PUT({ request }) {
	const { password, password_confirm } = await request.json()

	if (! password) {
		throwError('Password is required', 400)
	}
	if (password !== password_confirm) {
		throwError('Passwords do not match', 400)
	}

	const cookie = request.headers.get('cookie')

	const { id } = await fetch_current_user(cookie)

	if (! id) {
		throwError('User unknown', 404)
	}

	await sf({
		name: 'change_password',
		args: [id, password],
		cookie,
	})

	return json({})
}
