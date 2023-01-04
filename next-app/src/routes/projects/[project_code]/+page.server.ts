import { fetch_activities } from './activities/+server'
import { fetch_project_details } from './meta/+server'
import { can_view_activity } from '$lib/auth'
import { fetch_current_user } from '$lib/server/user'
import type { RequestEvent } from './$types'

export async function load({ params: { project_code }, request: { headers }}: RequestEvent): Promise<DashboardData> {
	const args = {
		project_code,
		cookie: headers.get('cookie') || '',
	}

	const data: DashboardData = {
		project: await fetch_project_details(args),
	}

	const { role } = await fetch_current_user(args.cookie)
	if (can_view_activity(role)) {
		const last_30_days = {
			start_date: daysAgo(30),
			end_date: new Date(),
		}

		data.activities = await fetch_activities({ ...last_30_days, ...args })
	}

	return data
}

function daysAgo(num_days: number): Date {
	const today = new Date();
	const daysAgo = new Date(today.setDate(today.getDate() - num_days))

	return daysAgo
}
