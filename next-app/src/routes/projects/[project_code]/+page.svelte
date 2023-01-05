<script lang=ts>
	import { page } from '$app/stores'
	import Activity from './Activity.svelte'
	import { GET } from '$lib/fetch'
	import {
		ImagesIcon,
		MessageAlertIcon,
		NotesIcon,
		PeopleIcon,
		VoiceIcon,
	} from '$lib/icons'
	import { Button } from '$lib/forms'
	import PageHeader from '$lib/PageHeader.svelte'
	import Stats from '$lib/Stats.svelte'
    import type { DashboardData } from './types'

	export let data: DashboardData

	let only_showing_subset = true

	$: project = data.project
	$: activities = data.activities
	$: stats = [
		{
			title: 'Users',
			value: project.num_users,
			icon: PeopleIcon,
		},
		{
			title: 'Entries',
			value: project.num_entries,
			icon: NotesIcon,
			url: `/app/lexicon/${ project.id }`,
		},
		{
			title: 'Entries with audio',
			value: project.num_entries_with_audio,
			icon: VoiceIcon,
			url: `/app/lexicon/${ project.id }#!/editor/entry/000000?filterBy=Audio`,
		},
		{
			title: 'Entries with pictures',
			value: project.num_entries_with_pictures,
			icon: ImagesIcon,
			url: `/app/lexicon/${ project.id }#!/editor/entry/000000?filterBy=Pictures`,
		},
		{
			title: 'Unresolved comments',
			value: project.num_unresolved_comments,
			icon: MessageAlertIcon,
			url: `/app/lexicon/${ project.id }#!/editor/entry/000000?filterBy=Comments`,
		},
	].filter(({ value }) => value !== undefined)

	async function load_all_activities() {
		activities = await GET({url: `/projects/${$page.params.project_code}/activities`})

		only_showing_subset = false
	}
</script>

<svelte:head>
	<title>Project Home</title>
</svelte:head>

<PageHeader>
	<span class='flex justify-between items-center'>
		{ project.name }

		<a rel=external href={ `/app/lexicon/${ project.id }` } class='btn btn-primary no-underline btn-xs sm:btn-md'>
			work on this project
		</a>
	</span>
</PageHeader>

<Stats {stats} />

{#if activities}
	<h2>Activity</h2>
	<Activity { activities } />

	{#if only_showing_subset}
		<footer class='flex justify-center mt-2'>
			<Button on:click={ load_all_activities } class='btn-outline btn-xs sm:btn-sm'>
				show all
			</Button>
		</footer>
	{/if}
{/if}
