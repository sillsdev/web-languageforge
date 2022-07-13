<script>
	import { page } from '$app/stores'
	import Activity from './_components/Activity.svelte'
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

	export let project
	export let activities

	let only_showing_subset = true
	const stats = [
		{
			title: 'Users',
			value: Number(1234).toLocaleString(),
			icon: PeopleIcon,
		},
		{
			title: 'Entries',
			value: Number(1234).toLocaleString(),
			icon: NotesIcon,
		},
		{
			title: 'Unresolved comments',
			value: Number(1234).toLocaleString(),
			icon: MessageAlertIcon,
		},
		{
			title: 'Entries with pictures',
			value: Number(1234).toLocaleString(),
			icon: ImagesIcon,
		},
		{
			title: 'Entries with audio',
			value: Number(1234).toLocaleString(),
			icon: VoiceIcon,
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
