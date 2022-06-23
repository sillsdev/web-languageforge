<script>
	export let activities

	$: sorted_activities = transform(activities).sort(byDateThenUser)

	// mappings in src/Api/Model/Shared/ActivityModel.php
	const action_display = {
		'add_entry': 'Add',
		'update_entry': 'Update',
		'add_user_to_project': 'Joined',
	}

	function transform(_activities) {
		return _activities.map(activity => {
			const date = new Date(activity.date)

			return {
				...activity,
				date: date.toLocaleDateString(),
				time: date.getTime(),
				fields: toNames(activity.fields),
		 	}
		})
	}

	function byDateThenUser(a, b) {
		return a.date === b.date ? a.user === b.user ? des(a.time, b.time) : asc(a.user, b.user) : des(a.date, b.date)
	}

	const asc = (a, b) => a > b ? 1 : -1
	const des = (a, b) => a < b ? 1 : -1

	function toNames(fields = []) {
		return fields.map(field => field.fieldName).join(', ')
	}
</script>

<!-- https://daisyui.com/components/table -->
<table class='table table-zebra'>
	<thead>
		<tr>
			<th>user</th>
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
				<td>{ activity.date } { activity.time }</td>
				<td>{ action_display[activity.action] || activity.action }</td>
				<td>{ activity.entry || '—' }</td>
				<td>{ activity.fields || '—' }</td>
			</tr>
		{:else}
			<tr><td>No activity yet</td></tr>
		{/each}
	</tbody>
</table>
