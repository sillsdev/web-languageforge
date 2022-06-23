<script>
	import Activity from './_components/Activity.svelte'
	import PageHeader from '$lib/PageHeader.svelte'

	export let project
	export let activities
</script>

<svelte:head>
	<title>Project Home</title>
</svelte:head>

<PageHeader class='flex justify-between'>
	{ project.name }
</PageHeader>

<h2>Activity</h2>
<Activity {activities} />
