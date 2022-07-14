<script>
	export let title
	export let value
	export let icon = undefined
</script>

<!-- https://daisyui.com/components/stat/ -->
<div class='stat place-items-center'>
	<dt class=stat-title>{ title }</dt>
	<dd class='stat-value text-primary'>{ value }</dd>

	{#if icon}
		<div class='stat-figure text-primary pl-4'>
			<svelte:component this={icon} />
		</div>
	{/if}
</div>
