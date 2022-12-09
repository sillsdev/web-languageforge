import { get_activities } from './activities/+server'
import { get as get_project_info } from './meta/+server'
import { can_view_activity } from '$lib/auth'
import { fetch_current_user } from '$lib/data/user'

export async function load({ params: { project_code }, request: { headers }}) {
	const args = {
		project_code,
		cookie: headers.get('cookie'),
	}

	const result = {
		project: await get_project_info(args),
	}

	const { role } = await current_user(args.cookie)
	if (can_view_activity(role)) {
		const last_30_days = {
			start_date: daysAgo(30),
			end_date: new Date(),
		}

		result.activities = await get_activities({ ...last_30_days, ...args })
	}

	return result
}

function daysAgo(num_days) {
	const today = new Date();
	const daysAgo = new Date(today.setDate(today.getDate() - num_days))

	return daysAgo
}
