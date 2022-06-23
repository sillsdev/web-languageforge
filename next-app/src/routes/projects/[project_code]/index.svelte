<script>
	import { page } from '$app/stores'
	import Activity from './_components/Activity.svelte'
	import { GET } from '$lib/fetch/client'
	import { Button } from '$lib/forms'
	import PageHeader from '$lib/PageHeader.svelte'

	export let project
	export let activities

	let only_showing_subset = true

	async function load_all_activities() {
		activities = await GET(`/projects/${$page.params.project_code}/activities`)

		only_showing_subset = false
	}
</script>

<svelte:head>
	<title>Project Home</title>
</svelte:head>

<PageHeader class='flex justify-between'>
	{ project.name }

	<a rel=external href={ `/app/lexicon/${ project.id }` } class='btn btn-primary no-underline'>
		work on this project
	</a>
</PageHeader>

<h2>Activity</h2>
<Activity { activities } />

{#if only_showing_subset}
	<footer class='flex justify-center'>
		<Button on:click={ load_all_activities } outlined small>
			show all
		</Button>
	</footer>
{/if}
