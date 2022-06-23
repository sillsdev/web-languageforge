<script>
	import { beforeNavigate } from '$app/navigation'
	import { error, dismiss } from '$lib/error'
	import ErrorIcon from '$lib/icons/ErrorIcon.svelte'

	let errContainer = null

	$: errContainer && $error.message && scrollIntoView(errContainer)
	$: beforeNavigate(() => $error.message && dismiss())

	const scrollIntoView = element => element.scrollIntoView({behavior: 'smooth'})
</script>

{#if $error.message}
	<!-- https://daisyui.com/components/alert -->
	<aside bind:this={errContainer} class='alert alert-error shadow-lg w-auto absolute top-0 z-10'>
		<ErrorIcon />

		<span>{$error.message}</span>

		<button on:click={dismiss} class='btn btn-ghost'>
			Dismiss
		</button>
	</aside>
{/if}
