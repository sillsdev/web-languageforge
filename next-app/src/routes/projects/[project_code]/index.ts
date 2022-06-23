import { sf } from '$lib/fetch/server'

export async function get({ params, request }) {
	let activities = []

	const cookie = request.headers.get('cookie')

	const { id, projectName, projectCode } = await sf({
		name: 'project_read_by_code',
		args: [params.project_code],
		cookie,
	})
	// src/Api/Model/Shared/Dto/ActivityListDto.php
	// const { activity } = await sf({
	// 	name: 'activity_list_dto_for_project',
		// src/Api/Model/Shared/Dto/ActivityListDto.php.__construct
	// 	args: [
	// 		params.project_code,
	// 		{
	// 			// endDate: ,
	// 			// limit: ,
	// 			// skip:
	// 		}
	// 	],
	// 	cookie,
	// })

	// activities = activity.map(transform)

	return {
		body: {
			project: {
				id,
				code: projectCode,
				name: projectName,
			},
			// activities,
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
