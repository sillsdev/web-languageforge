<script>
	export let activities

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

	function transform(_activities) {
		return _activities.map(activity => {
			const date = new Date(activity.date)

			return {
				...activity,
				date_locale: date.toLocaleDateString(),
				date_iso: date.toISOString(),
				time: date.getTime(),
				fields: toNames(activity.fields),
		 	}
		})
	}

	function byDateThenUser(a, b) {
		return a.date_iso === b.date_iso ? a.user === b.user ? des(a.time, b.time)
															 : asc(a.user, b.user)
		                                 : des(a.date_iso, b.date_iso)
	}

	const asc = (a, b) => a > b ? 1 : -1
	const des = (a, b) => a < b ? 1 : -1

	function toNames(fields = []) {
		return fields.map(field => field.fieldName).join(', ')
	}
</script>

<!-- https://daisyui.com/components/table -->
<div class='overflow-x-auto'>
	<table class='table table-zebra m-0'>
		<thead>
			<tr>
				<td>user</td>
				<th>date</th>
				<th>action</th>
				<th>entry</th>
				<th>fields</th>
			</tr>
		</thead>
		<tbody>
			{#each sorted_activities as activity}
				<tr>
					<td>{ activity.user }</td>
					<td>{ activity.date_locale }</td>
					<td>{ action_display[activity.action] || activity.action }</td>
					<td>{ activity.entry || '—' }</td>
					<td>{ activity.fields || '—' }</td>
				</tr>
			{:else}
				<tr><td>No activity</td></tr>
			{/each}
		</tbody>
	</table>
</div>
