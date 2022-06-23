import { sf } from '$lib/fetch/server'

export async function get({ params, request }) {
	const project = {
		code: params.project_code,
	}

	let activities = []

	const cookie = request.headers.get('cookie')

	// src/Api/Model/Shared/Dto/ActivityListDto.php
	const { activity } = await sf({
		name: 'activity_list_dto_for_project',
		// src/Api/Model/Shared/Dto/ActivityListDto.php.__construct
		args: [
			project.code,
			{
				// endDate: ,
				// limit: ,
				// skip:
			}
		],
		cookie,
	})

	activities = activity.map(transform)

	return {
		body: {
			project,
			activities,
		},
	}
}

function transform({id, action, date, content}) {
	return {
		id,
		action,
		date,
		user: content.user,
		entry: content.entry || '',
		fields: content.changes || [],
	}
}
