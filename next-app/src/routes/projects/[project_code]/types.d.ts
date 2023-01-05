import type { ProjectDetails } from './meta/types'

type DashboardData = {
	project: ProjectDetails,
	activities?: undefined | Activity[],
}

interface AugmentedActivity extends Activity {
	date_locale: string,
	date_iso: string,
	time: number,
	fields: string,
}
