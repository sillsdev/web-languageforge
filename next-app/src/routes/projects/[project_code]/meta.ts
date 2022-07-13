import { sf } from '$lib/fetch/server'

export async function get({ project_code, cookie }) {
	//TODO: multiple calls that can be run in parallel...
	const { id, projectName: name, users } = await sf({
		name: 'project_read_by_code', // src/Api/Model/Shared/ProjectModel.php->getByProjectCode
		args: [ project_code ],
		cookie,
	})

	const results = await sf({ //TODO: deconstruct this once all data is worked out
		name: 'lex_stats',
		args: [ project_code ],
		cookie,
	})

	const entries = results.entries

	return {
		id,
		code: project_code,
		name,
		num_entries: entries.length,
		num_entries_with_audio: 1234,
		num_entries_with_pictures: 1234,
		num_unresolved_comments: 1234,
		num_users: Object.keys(users).length,
	}
}
