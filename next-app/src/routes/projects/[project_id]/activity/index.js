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

		const { activity } = await sf({
			name: 'activity_list_dto',
			args: [{
				startDate: null, // TODO: is this working?
				endDate: null, // TODO: is this working?
				limit: 10, // TODO: is this working?
				skip: 0
			}],
			cookie,
		})

		activities = Object
			.values(activity)
			.filter(({ content }) => content.project === project.id)
			.filter(({ action }) => action !== 'add_user_to_project')
			.map(transform)
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
