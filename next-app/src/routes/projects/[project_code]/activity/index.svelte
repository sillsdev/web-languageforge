<script>
	import PageHeader from '$lib/PageHeader.svelte'

	export let project
	export let activities = []

	const action_display = {
		'add_entry': 'Add',
		'update_entry': 'Update',
		'add_user_to_project': 'Joined',
	}

	function toNames(fields = []) {
		return fields.map(field => field.fieldName).join(', ')
	}
</script>

<svelte:head>
	<title>Project activity</title>
</svelte:head>

<PageHeader>
	Activity for {project.code}
</PageHeader>

<!-- https://daisyui.com/components/table -->
<table class='table table-zebra'>
	<thead>
		<tr>
			<th>user</th>
			<th>date</th>
			<th>action</th>
			<th>entry</th>
			<th>number of fields</th>
		</tr>
	</thead>
	<tbody>
		{#each activities as activity}
			<tr>
				<td>{activity.user}</td>
				<td>{new Date(activity.date).toLocaleString()}</td>
				<td>{action_display[activity.action]}</td>
				<td>{activity.entry}</td>
				<td>{toNames(activity.fields)}</td>
			</tr>
		{:else}
			<tr><td>No activity yet</td></tr>
		{/each}
	</tbody>
</table>
