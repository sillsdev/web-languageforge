import { sf, type Rpc } from '$lib/server/sf'
import { fetch_current_user } from '$lib/server/user'
import { fail, redirect } from '@sveltejs/kit'
import type { RequestEvent } from '../$types'

export const actions = {
	default: async ({ request }: RequestEvent) => {
		const submissions = await request.formData()

		const new_password = submissions.get('new_password') as string
		const new_password_confirm = submissions.get('new_password_confirm')

		if (! new_password) {
			return fail(400, { failed: 'Password is required' })
		}

		if (new_password !== new_password_confirm) {
			return fail(400, { failed: 'Passwords do not match' })
		}

		const cookie = request.headers.get('cookie') || ''

		const { id } = await fetch_current_user(cookie)

		await sf({
			name: 'change_password',
			args: [id, new_password],
			cookie,
		})

		throw redirect(303, '/password/changed')
	}
}
