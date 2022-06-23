<script>
	import PageHeader from '$lib/PageHeader.svelte'

	export let project
	export let activities = []

</script>

<svelte:head>
	<title>Project activity</title>
</svelte:head>

<PageHeader>
	Activity for {project.id}
</PageHeader>

{#each activities as activity}
	<pre>{JSON.stringify(activity, null, 2)}</pre>
{:else}
	<p>No activity yet</p>
{/each}
