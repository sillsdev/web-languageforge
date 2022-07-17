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

function has_audio(anEntry) {
	const is_audio = writing_system => writing_system.endsWith('-audio') // naming convention imposed by src/angular-app/languageforge/lexicon/settings/configuration/input-system-view.model.ts L81

	// examples of possible locations where audio may be found in the entry's data:
	// 1.  Fields within an "entry"
	// {
	// 		lexeme: {
	//			'...-audio': '...'
	//		},
	//		pronunciation: {
	//			'...-audio': '...'
	//		}
	// }
	const in_fields = fields => Object.keys(fields).some(name => Object.keys(fields[name]).some(is_audio))

	// 2.  Fields within a "meaning"
	// {
	//		lexeme: '...',
	//		pronunciation: '...',
	//		senses: [{
	//			'...': {
	//				'...-audio': '...'
	//			}
	// 		}]
	// }
	const in_meaning = senses => senses.some(in_fields)

	const { senses, ...entry } = anEntry

	return in_fields(entry) || in_meaning(senses)
	// TODO: (audio can be found in lots of places other than lexeme) need to look at: https://github.com/sillsdev/web-languageforge/blob/develop/src/angular-app/bellows/core/offline/editor-data.service.ts#L523
	// ref code shows additional logic for "examples".... do I need more logic?, can audio be in a different location than the two I've got so far?
}
