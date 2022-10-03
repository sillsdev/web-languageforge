import { sf } from '$lib/fetch/server'

export async function get({ project_code, cookie }) {
	const [
		{ id, projectName: name, users },
		{ entries, comments }
	] = await Promise.all([
		sf({ name: 'project_read_by_code', args: [ project_code ], cookie }),
		sf({ name: 'lex_stats_all', args: [ project_code ], cookie }),
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
	return entry.senses?.some(sense => sense.pictures)
}

// audio can be found in lots of places other than lexeme, ref impl used: https://github.com/sillsdev/web-languageforge/blob/develop/src/angular-app/bellows/core/offline/editor-data.service.ts#L523
function has_audio(anEntry) {
	const contains_audio = writing_system => writing_system.endsWith('-audio') // naming convention imposed by src/angular-app/languageforge/lexicon/settings/configuration/input-system-view.model.ts L81

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
	const in_fields = fields => Object.keys(fields).some(name => Object.keys(fields[name]).some(contains_audio))

	// 2.  Fields within a "meaning" (note: senses may not be present)
	// {
	//		lexeme: '...',
	//		pronunciation: '...',
	//		senses: [{
	//			'...': {
	//				'...-audio': '...'
	//			}
	// 		}]
	// }
	const in_meaning = (senses = []) => senses.some(in_fields)

	// 3.  Fields within a "meaning"'s example (note: senses may not be present)
	// {
	//		lexeme: '...',
	//		pronunciation: '...',
	//		senses: [{
	//			examples: {
	//				sentence: {
	//					'...-audio': '...'
	//				},
	//				'...': {
	//					'...-audio': '...'
	//				}
	//			}
	// 		}]
	// }
	const in_example = (senses = []) => senses.some(sense => in_meaning(sense.examples))

	const { senses, ...entry } = anEntry

	return in_fields(entry) || in_meaning(senses) || in_example(senses)
}
