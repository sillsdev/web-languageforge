<script>
import { beforeNavigate } from '$app/navigation'
import { error, dismiss } from '$lib/error'

let errContainer = null

$: errContainer && $error.message && scrollIntoView(errContainer)
$: beforeNavigate(() => $error.message && dismiss())

const scrollIntoView = element => element.scrollIntoView({behavior: 'smooth'})
</script>

{#if $error.message}
	<aside bind:this={errContainer}>
		<svg xmlns=http://www.w3.org/2000/svg class='stroke-current flex-shrink-0 h-6 w-6' fill=none viewBox='0 0 24 24'><path stroke-linecap=round stroke-linejoin=round stroke-width=2 d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>

		<span>{$error.message}</span>

		<button on:click={dismiss}>Dismiss</button>
	</aside>
{/if}

<style>
aside {
	@apply
		/* https://daisyui.com/components/alert */
		alert
		alert-error
		shadow-lg

		w-auto

		absolute
		top-0
		z-10;
}

button {
	@apply
		/* https://daisyui.com/components/button */
		btn
		btn-ghost;
}
</style>

