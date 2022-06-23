<script>
	import PageHeader from '$lib/PageHeader.svelte'

	export let project

</script>

<svelte:head>
	<title>Project Home</title>
</svelte:head>

<PageHeader>
	{ project.name }
</PageHeader>
