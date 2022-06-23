<script>
	import PageHeader from '$lib/PageHeader.svelte'

	export let project
	export let activities = []
	const action_display = {
		'add_entry': 'Add',
		'update_entry': 'Update',
	}

</script>

<svelte:head>
	<title>Project activity</title>
</svelte:head>

<PageHeader>
	Activity for {project.id}
</PageHeader>

<table>
	<thead>
		<tr>
			<th>user</th>
			<th>date</th>
			<th>action</th>
			<th>entry</th>
			<th>number of fields</th>
		</tr>
	</thead>
	{#each activities as activity}
		<tr>
			<td>{activity.user}</td>
			<td>{new Date(activity.date).toLocaleString()}</td>
			<td>{action_display[activity.action]}</td>
			<td>{activity.entry}</td>
			<td>{activity.num_fields || `—`}</td>
		</tr>
	{:else}
		<tr><td>No activity yet</td></tr>
	{/each}
</table>
