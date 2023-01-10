import { can_view_comments } from '$lib/auth'
import { fetch_current_user } from '$lib/server/user'
import { sf } from '$lib/server/sf'

type LegacyProjectDetails = {
	id: string,
	projectName: string,
	users: object[],
}

type LegacyStats = {
	entries: object[],
	comments: Comment[],
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
	num_entries_with_audio: number,
	num_entries_with_pictures: number,
	num_unresolved_comments?: number,
}

export async function fetch_project_details({ project_code, cookie }) {
	const { id, projectName: name, users }: LegacyProjectDetails = await sf({ name: 'set_project', args: [ project_code ], cookie })
	const { entries, comments }: LegacyStats = await sf({ name: 'lex_stats', cookie })

	const details: ProjectDetails = {
		id,
		code: project_code,
		name,
		num_users: Object.keys(users).length,
		num_entries: entries.length,
		num_entries_with_audio: entries.filter(has_audio).length,
		num_entries_with_pictures: entries.filter(has_picture).length,
	}

	const { role } = await fetch_current_user(cookie)
	if (can_view_comments(role)) {
		const unresolved_comments = comments.filter(({ status }) => status !== 'resolved')

		details.num_unresolved_comments = unresolved_comments.length
	}

	return details
}

function has_picture(entry: object) {
	return JSON.stringify(entry).includes('"pictures":')
}

// audio can be found in lots of places other than lexeme, ref impl used: https://github.com/sillsdev/web-languageforge/blob/develop/src/angular-app/bellows/core/offline/editor-data.service.ts#L523
function has_audio(entry: object) {
	return JSON.stringify(entry).includes('-audio":') // naming convention imposed by src/angular-app/languageforge/lexicon/settings/configuration/input-system-view.model.ts L81
}
