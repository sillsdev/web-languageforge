import { sf } from '$lib/fetch/server'

export async function get({ params : { project_code }, request: { headers } }) {
	const cookie = headers.get('cookie')

	const { id, projectName: name, projectCode: code } = await getProjectInfo(project_code, cookie)

	const { activity } = await getActivities(project_code, cookie)

	const activities = activity.map(transform)

	return {
		body: {
			project: {
				id,
				code,
				name,
			},
			activities,
		},
	}
}

async function getProjectInfo(project_code, cookie) {
	return await sf({
		name: 'project_read_by_code',
		args: [project_code],
		cookie,
	})
}

function getActivities(project_code, cookie) {
	return sf({
		// src/Api/Model/Shared/Dto/ActivityListDto.php
		name: 'activity_list_dto_for_project',
		args: [ // src/Api/Model/Shared/Dto/ActivityListDto.php.__construct
			project_code,
			{
				// endDate: ,
				// limit: ,
				// skip:
			}
		],
		cookie,
	})
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
