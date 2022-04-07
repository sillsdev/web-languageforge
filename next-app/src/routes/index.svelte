<script>
import { start, stop } from '$lib/progress'
</script>

<h1>LFNext app</h1>

<section>
	<a href=/app/changepassword sveltekit:prefetch>Change password</a>
</section>

<section>
	<button on:click={() => start('index.svelte')}>start progress</button>
	<button on:click={() => stop('index.svelte')}>stop progress</button>
</section>

<style>
section {
	padding-top: 1rem;
	padding-bottom: 1rem;
}
</style>
