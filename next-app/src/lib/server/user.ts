import { error } from '@sveltejs/kit'
import { sf } from '$lib/server/sf'

export async function fetch_current_user(cookie: string) {
	const { userId, userProjectRole } = await sf({
		name: 'session_getSessionData',
		cookie,
	})

	if (! userId) {
		throw error(404, 'User unknown')
	}

	return {
		id: userId,
		role: userProjectRole,
	}
}
