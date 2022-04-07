import { CREATE } from '$lib/data'

export async function change(new_password, new_password_confirm) {
	const { result: { userId } } = await CREATE('/api/sf', {
		id: 1,
		method: 'session_getSessionData',
		params: {
			orderedParams:[],
		},
		version: '2.0',
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
		version: '2.0',
	})
}

// POST /api/sf TODO: this should really be a PUT
// {
// 	"id":3 // TODO: is this necessary?
//     "method":"change_password",
//     "params": {
// 		"orderedParams":
// 		[
// 			"611bb9ecf88b8b192254a012",  //TODO: not sure yet where to get this from, probably a user ID
// 			"user-entered-password"
// 		]
//     },
// 	"version":"2.0",
// }
