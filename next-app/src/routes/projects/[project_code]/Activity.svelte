<script lang=ts>
    import type { Activity, Field } from './activities/+server'

	export let activities: Activity[]

	interface AugmentedActivity extends Activity {
		date_locale: string,
		date_time_locale: string,
		date_iso: string,
		time: number,
		field_names: string,
	}

	$: sorted_activities = transform(activities).sort(byDateThenUser)

	// mappings in src/Api/Model/Shared/ActivityModel.php
	const action_display = {
		'add_entry': 'Added entry',
		'add_lex_comment': 'Added comment',
		'add_lex_reply': 'Replied',
		'add_user_to_project': 'Joined',
		'delete_entry': 'Deleted entry',
		'delete_lex_comment': 'Deleted comment',
		'delete_lex_reply': 'Deleted reply',
		'lexCommentDecreaseScore': 'Un-liked',
		'lexCommentIncreaseScore': 'Liked',
		'update_entry': 'Updated entry',
		'update_lex_comment': 'Updated comment',
		'update_lex_comment_status': 'Updated status',
		'update_lex_reply': 'Updated reply'
	}

	function transform(_activities: Activity[]): AugmentedActivity[] {
		return _activities.map(activity => {
			const date = new Date(activity.date)

			return {
				...activity,
				date_locale: date.toLocaleDateString(),
                date_time_locale: date.toLocaleString(),
				date_iso: date.toISOString().split('T')[0],
				time: date.getTime(),
				field_names: to_names(activity.fields),
		 	}
		})
	}

	function byDateThenUser(a: AugmentedActivity, b: AugmentedActivity) {
        if (a.date_iso !== b.date_iso) {
            return des(a.date_iso, b.date_iso);
        }

        if (a.user.username !== b.user.username) {
            return asc(a.user.username, b.user.username);
        }

        return des(a.time, b.time);
	}

	const asc = (a: string | number, b: string | number) => a > b ? 1 : -1
	const des = (a: string | number, b: string | number) => a < b ? 1 : -1

	function to_names(fields: Field[] = []): string {
        // This is quite rudimentary, but far better than nothing
		return [...new Set(fields.map(field => field.fieldLabel?.label)
            .filter(label => !!label))]
            .join(', ')
	}
</script>

<!-- https://daisyui.com/components/table -->
<div class='overflow-x-auto'>
	<table class='table table-zebra m-0'>
		<thead>
			<tr>
				<td>user</td>
				<th>action</th>
				<th>entry</th>
				<th>fields</th>
				<th>date</th>
			</tr>
		</thead>
		<tbody>
			{#each sorted_activities as activity}
				<tr>
					<td>{ activity.user.username }</td>
					<td>{ action_display[activity.action] || activity.action }</td>
					<td>{ activity.entry || '—' }</td>
					<td>{ activity.field_names || '—' }</td>
					<td>{ activity.date_time_locale }</td>
				</tr>
			{:else}
				<tr><td>No activity</td></tr>
			{/each}
		</tbody>
	</table>
</div>
