import { fetch_activities } from './activities/+server'
import { fetch_project_details } from './meta/+server'
import { can_view_activity } from '$lib/auth'
import { fetch_current_user } from '$lib/server/user'

export async function load({ params: { project_code }, request: { headers }}) {
	const args = {
		project_code,
		cookie: headers.get('cookie'),
	}

	const result = {
		project: await fetch_project_details(args),
	}

	const { role } = await fetch_current_user(args.cookie)
	if (can_view_activity(role)) {
		const last_30_days = {
			start_date: daysAgo(30),
			end_date: new Date(),
		}

		result.activities = await fetch_activities({ ...last_30_days, ...args })
	}

	return result
}

function daysAgo(num_days) {
	const today = new Date();
	const daysAgo = new Date(today.setDate(today.getDate() - num_days))

	return daysAgo
}
