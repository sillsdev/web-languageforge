import { can_view_comments } from '$lib/auth'
import { fetch_current_user } from '$lib/server/user'
import { sf } from '$lib/server/sf'

type LegacyProjectDetails = {
	id: string,
	projectName: string,
	users: object[],
}

type LegacyStats = {
	num_entries,
	num_entries_with_pictures,
	num_unresolved_comments,
}

type Comment = {
	status: string,
}

export type ProjectDetails = {
	id: string,
	code: string,
	name: string,
	num_users: number,
	num_entries: number,
	num_entries_with_pictures: number,
	num_unresolved_comments?: number,
}

export async function fetch_project_details({ project_code, cookie }) {
	const { id, projectName: name, users }: LegacyProjectDetails = await sf({ name: 'set_project', args: [ project_code ], cookie })
	const stats: LegacyStats = await sf({ name: 'lex_stats', cookie })

	const details: ProjectDetails = {
		id,
		code: project_code,
		name,
		num_users: Object.keys(users).length,
		num_entries: stats.num_entries,
		num_entries_with_pictures: stats.num_entries_with_pictures,
	}

	const { role } = await fetch_current_user(cookie)
	if (can_view_comments(role)) {
		details.num_unresolved_comments = stats.num_unresolved_comments
	}

	return details
}
