import { can_view_comments } from '$lib/auth'
import { fetch_current_user } from '$lib/server/user'
import { sf } from '$lib/server/sf'

export async function fetch_project_details({ project_code, cookie }) {
	const { id, projectName: name, users } = await sf({ name: 'set_project', args: [ project_code ], cookie })
	const { entries, comments } = await sf({ name: 'lex_stats', cookie })

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

function has_picture(entry) {
	return entry.senses?.some(sense => sense.pictures)
}

// audio can be found in lots of places other than lexeme, ref impl used: https://github.com/sillsdev/web-languageforge/blob/develop/src/angular-app/bellows/core/offline/editor-data.service.ts#L523
function has_audio(entry) {
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

	const { senses, ...fields } = entry

	return in_fields(fields) || in_meaning(senses) || in_example(senses)
}
