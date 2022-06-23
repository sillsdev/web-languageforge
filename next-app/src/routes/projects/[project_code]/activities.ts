import { sf } from '$lib/fetch/server'

export async function get({ params: { project_code }, request: { headers } }) {
	const cookie = headers.get('cookie')

	const activities = await get_activities({ project_code, cookie })

	return {
		body: activities,
	}
}

// src/Api/Model/Shared/Dto/ActivityListDto.php
// src/Api/Model/Shared/Dto/ActivityListDto.php->ActivityListModel.__construct
export async function get_activities({ project_code, cookie, start_date, end_date }) {
	const args = {
		name: 'activity_list_dto_for_project',
		args: [
			project_code,
			{
				startDate: start_date && start_date.toLocaleDateString(),
				endDate: end_date && end_date.toLocaleDateString(),
			}
		],
		cookie,
	}

	const { activity } = await sf(args)

	return activity.map(transform)
}

function transform({ id, action, date, content }) {
	return {
		id,
		action,
		date,
		user: content.user,
		entry: content.entry || '',
		fields: content.changes || [],
	}
}