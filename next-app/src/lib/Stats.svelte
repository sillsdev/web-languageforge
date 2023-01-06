<script lang=ts>
    import { goto } from '$app/navigation'

	type Stat = {
		title: string,
		value: number | undefined,
		icon?: any,
		url?: string | URL,
	}

	export let stats: Stat[]

	$: _stats = stats.map(({ title, value, icon, url }) => ({
		title,
		value,
		icon,
		href: value ? url : ''
	}))

	const clicked = (href: string | URL = '') => href ? goto(href) : {}
</script>

<!-- https://daisyui.com/components/stat/ -->
<dl class='stats shadow max-w-full'> <!-- added max-w-full so a horiz scroll will appear on small screens rather than stretching the whole doc -->
	{#each _stats as { title, value, icon, href }}
		<div class='stat place-items-center' class:href on:click={ () => clicked(href) } on:keydown={ () => clicked(href) }>
			<dt class=stat-title>{ title }</dt>
			<dd class='stat-value text-primary'>{ Number(value).toLocaleString() }</dd>

			{#if icon}
				<div class='stat-figure text-primary pl-4'>
					<svelte:component this={icon} />
				</div>
			{/if}
		</div>
	{/each}
</dl>

<style>
	.href {
		cursor: pointer;
	}
</style>
