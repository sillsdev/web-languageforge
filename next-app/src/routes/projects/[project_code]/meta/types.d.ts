type ProjectDetails = {
	id: string,
	code: string,
	name: string,
	num_users: number,
	num_entries: number,
	num_entries_with_audio: number,
	num_entries_with_pictures: number,
	num_unresolved_comments?: number,
}

type Entry = {
	senses?: Sense[],
	[key: string]: Field,
}

interface Sense extends Field {
	examples?: Field[],
	pictures?: Field[],
}

type Field = [string, string | Field | Field[]]
