import { error, json } from '@sveltejs/kit'
import { sf } from '$lib/fetch/server'

export async function PUT({ request }) {
	const { password, password_confirm } = await request.json()

	if (! password) {
		throw error(400, 'Password is requiired')
	}
	if (password !== password_confirm) {
		throw error(400, 'Passwords do not match')
	}

	const cookie = request.headers.get('cookie')

	const { userId } = await sf({
		name: 'session_getSessionData',
		cookie,
	})

	if (! userId) {
		throw error(404, 'User unknown')
	}

	await sf({
		name: 'change_password',
		args: [userId, password],
		cookie,
	})

	return json({})
}
