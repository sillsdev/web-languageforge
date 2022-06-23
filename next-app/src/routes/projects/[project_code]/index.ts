import { get_activities } from './activities'
import { sf } from '$lib/fetch/server'

export async function get({ params: { project_code }, request: { headers }}) {
	const args = {
		project_code,
		cookie: headers.get('cookie'),
	}

	const { id, projectName: name } = await get_project_info(args)

	const last_30_days = {
		start_date: daysAgo(30),
		end_date: new Date(),
	}
	const activities = await get_activities({ ...last_30_days, ...args })

	return {
		body: {
			project: {
				id,
				code: project_code,
				name,
			},
			activities,
		},
	}
}

async function get_project_info({ project_code, cookie }) {
	return await sf({
		name: 'project_read_by_code',
		args: [ project_code ],
		cookie,
	})
}

function daysAgo(num_days) {
	const today = new Date();
	const daysAgo = new Date(today.setDate(today.getDate() - num_days))

	return daysAgo
}
