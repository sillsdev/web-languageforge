<script>
	import { page } from '$app/stores'
	import Activity from './Activity.svelte'
	import { GET } from '$lib/fetch/client'
	import {
		ImagesIcon,
		MessageAlertIcon,
		NotesIcon,
		PeopleIcon,
		VoiceIcon,
	} from '$lib/icons'
	import { Button } from '$lib/forms'
	import PageHeader from '$lib/PageHeader.svelte'
	import Stats from '$lib/stats'

	export let data;

	let only_showing_subset = true

	$: project = data.project
	$: activities = data.activities
	$: stats = [
		{
			title: 'Users',
			value: Number(project.num_users).toLocaleString(),
			icon: PeopleIcon,
		},
		{
			title: 'Entries',
			value: Number(project.num_entries).toLocaleString(),
			icon: NotesIcon,
		},
		{
			title: 'Entries with audio',
			value: Number(project.num_entries_with_audio).toLocaleString(),
			icon: VoiceIcon,
		},
		{
			title: 'Entries with pictures',
			value: Number(project.num_entries_with_pictures).toLocaleString(),
			icon: ImagesIcon,
		},
		{
			title: 'Unresolved comments',
			value: Number(project.num_unresolved_comments).toLocaleString(),
			icon: MessageAlertIcon,
		},
	]

	async function load_all_activities() {
		activities = await GET(`/projects/${$page.params.project_code}/activities`)

		only_showing_subset = false
	}
</script>

<svelte:head>
	<title>Project Home</title>
</svelte:head>

<PageHeader class='flex justify-between items-center'>
	{ project.name }

	<a rel=external href={ `/app/lexicon/${ project.id }` } class='btn btn-primary no-underline btn-xs sm:btn-md'>
		work on this project
	</a>
</PageHeader>

<Stats class=max-w-full>
	{#each stats as { title, value, icon }}
		<Stats.Stat { title } { value } { icon } />
	{/each}
</Stats>

<h2>Activity</h2>
<Activity { activities } />

{#if only_showing_subset}
	<footer class='flex justify-center mt-2'>
		<Button on:click={ load_all_activities } class='btn-outline btn-xs sm:btn-sm'>
			show all
		</Button>
	</footer>
{/if}
