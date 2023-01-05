<script>
    import { goto } from '$app/navigation'

	export let title
	export let value
	export let icon = undefined
	export let href = undefined

	const clicked = () => href ? goto(href) : {}
</script>

<!-- https://daisyui.com/components/stat/ -->
<div class='stat place-items-center' class:href on:click={ clicked } on:keydown={ clicked }>
	<dt class=stat-title>{ title }</dt>
	<dd class='stat-value text-primary'>{ value }</dd>

	{#if icon}
		<div class='stat-figure text-primary pl-4'>
			<svelte:component this={icon} />
		</div>
	{/if}
</div>

<style>
	.href {
		cursor: pointer;
	}
</style>
