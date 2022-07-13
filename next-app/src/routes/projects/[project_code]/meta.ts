import { sf } from '$lib/fetch/server'

export async function get({ project_code, cookie }) {
	const { id, projectName: name, users } = await sf({
		name: 'project_read_by_code', // src/Api/Model/Shared/ProjectModel.php->getByProjectCode
		args: [ project_code ],
		cookie,
	})

	return {
		id,
		code: project_code,
		name,
		num_entries: 1234,
		num_entries_with_audio: 1234,
		num_entries_with_pictures: 1234,
		num_unresolved_comments: 1234,
		num_users: Object.keys(users).length,
	}
}
