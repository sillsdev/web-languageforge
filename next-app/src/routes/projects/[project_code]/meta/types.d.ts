export

//TODO: rethink importing these definition files... you can accidentally import the wrong types.

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
