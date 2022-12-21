type ActivitiesInput = {
	cookie: string,
	start_date?: Date,
	end_date?: Date,
}

type LegacyResult = {
	activity: LegacyActivity[],
}

type LegacyActivity = {
	id: string,
	action: string,
	date: string,
	content: {
		user: string,
		entry?: string,
		changes?: string[],
	},
}

type Activity = {
	id: string,
	action: string,
	date: string,
	user: string,
	entry: string,
	fields: string[],
}

