import { error, json } from '@sveltejs/kit'
import { fetch_current_user } from '$lib/server/user'
import { sf } from '$lib/server/sf'

export async function PUT({ request }) {
	const { password, password_confirm } = await request.json()

	if (! password) {
		throw error(400, 'Password is required')
	}
	if (password !== password_confirm) {
		throw error(400, 'Passwords do not match')
	}

	const cookie = request.headers.get('cookie')

	const { id } = await fetch_current_user(cookie)

	await sf({
		name: 'change_password',
		args: [id, password],
		cookie,
	})

	return json({})
}
