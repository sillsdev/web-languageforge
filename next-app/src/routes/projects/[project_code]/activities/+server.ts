import { json } from '@sveltejs/kit'
import { sf, type Rpc } from '$lib/server/sf'
import type { RequestEvent } from './$types'

type ActivitiesInput = {
	cookie: string,
	start_date?: Date,
	end_date?: Date,
}

type LegacyResult = {
	activity: LegacyActivity[],
}

export type Field = {
	name: string,
}

type LegacyActivity = {
	id: string,
	action: string,
	date: string,
  userRef: {
    username: string,
    avatar_ref: string
  },
	content: {
		user: string,
		entry?: string,
		changes?: Field[],
	},
}

export type Activity = {
	id: string,
	action: string,
	date: string,
	user: string,
  avatar: string,
	entry: string,
	fields: Field[],
}

export async function GET({ params: { project_code }, request: { headers } }: RequestEvent) {
	const cookie = headers.get('cookie') || ''

	await sf({ name: 'set_project', args: [ project_code ], cookie })

	const activities = await fetch_activities({ cookie })

	return json(activities)
}

// src/Api/Model/Shared/Dto/ActivityListDto.php
// src/Api/Model/Shared/Dto/ActivityListDto.php->ActivityListModel.__construct
export async function fetch_activities({ cookie, start_date, end_date }: ActivitiesInput) {
	const args: Rpc = {
		name: 'activity_list_dto_for_current_project',
		args: [
			{
				startDate: start_date,
				endDate: end_date,
				limit: start_date || end_date ? 50 : 0,
			},
		],
		cookie,
	}

	const { activity }: LegacyResult = await sf(args)

	return activity.map(transform)
}

function transform({ id, action, date, content, userRef }: LegacyActivity): Activity {
	return {
		id,
		action,
		date,
		user: userRef.username,
		avatar: userRef.avatar_ref,
		entry: content.entry || '',
		fields: content.changes || [],
	}
}
