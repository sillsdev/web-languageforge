import { page } from '$app/stores'
import { throwError } from '$lib/error'
import { sf } from '$lib/fetch/server'

// TODO: next, build out the api to simply convert the activity into an array
// TODO: next, start to peel off the individual properties
export async function get({ params, request }) {
	const project = {
		id: params.project_id,
	}

	let activities = []

	try {
		const cookie = request.headers.get('cookie')

		// src/Api/Model/Shared/Dto/ActivityListDto.php
		const { activity } = await sf({
			name: 'activity_list_dto_for_project',
			// src/Api/Model/Shared/Dto/ActivityListDto.php.__construct
			args: [{
				projectId: project.id,
				// endDate: ,
				// limit: ,
				// skip:
			}],
			cookie,
		})
console.log(activity)
		activities = Object
			.values(activity)
			// .filter(({ content }) => content.project === project.id)
			.filter(({ action }) => action !== 'add_user_to_project')
			.map(transform)
			//TODO: limit to 25? seems too arbitrary, I'm inclined to grab last two weeks worth
	} catch (error) {
		return {
			status: error.code,
			body: error,
		}
	}

	return {
		body: {
			project,
			activities,
		},
	}
}

function transform({ id, action, date, content}) {
	return {
		id,
		action,
		date,
		user: content.user,
		entry: content.entry || '',
		fields: content.changes || [],
	}
}
