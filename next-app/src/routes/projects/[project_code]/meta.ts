import { sf } from '$lib/fetch/server'

export async function get({ project_code, cookie }) {
	const [
		{ id, projectName: name, users },
		{ entries, comments }
	] = await Promise.all([
		sf({ name: 'project_read_by_code', args: [ project_code ], cookie }),
		sf({ name: 'lex_stats', args: [ project_code ], cookie }),
	])

	const entries_with_picture = entries.filter(has_picture)
	const entries_with_audio = entries.filter(has_audio)
	const unresolved_comments = comments.filter(({ status }) => status !== 'resolved')

	return {
		id,
		code: project_code,
		name,
		num_entries: entries.length,
		num_entries_with_audio: entries_with_audio.length,
		num_entries_with_pictures: entries_with_picture.length,
		num_unresolved_comments: unresolved_comments.length,
		num_users: Object.keys(users).length,
	}
}

function has_picture(entry) {
	return entry.senses.some(sense => sense.pictures)
}

function has_audio(entry) {
	return Object.keys(entry.lexeme).some(key => key.endsWith('-audio')) // naming convention imposed by src/angular-app/languageforge/lexicon/settings/configuration/input-system-view.model.ts L81
}
