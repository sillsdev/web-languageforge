import { error } from '@sveltejs/kit'
import { sf } from '$lib/server/sf'

type LegacySession = {
	userId: string,
	userProjectRole: string,
}

type User = {
	id: string,
	role: string,
}

export async function fetch_current_user(cookie: string): Promise<User> {
	const { userId, userProjectRole }: LegacySession = await sf({
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
