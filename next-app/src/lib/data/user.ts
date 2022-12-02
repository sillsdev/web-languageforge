import { throwError } from '$lib/error'
import { sf } from '$lib/fetch/server'

export async function current_user(cookie) {
	const { userId, userProjectRole } = await sf({
		name: 'session_getSessionData',
		cookie,
	})

	if (! userId) {
		throwError('User unknown', 404)
	}

	return {
		id: userId,
		role: userProjectRole,
	}
}
