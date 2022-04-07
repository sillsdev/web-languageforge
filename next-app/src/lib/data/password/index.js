import { CREATE } from '$lib/data'

export async function change(new_password, new_password_confirm) {
	const { result: { userId } } = await CREATE('/api/sf', {
		id: 1,
		method: 'session_getSessionData',
		params: {
			orderedParams:[],
		},
	})

	return await CREATE('/api/sf', {
		id: 2,
		method: 'change_password',
		params: {
			orderedParams:
			[
				userId,
				new_password,
			],
		},
	})
}
