<script>
import '$lib/app.css'
import Header from '$lib/Header.svelte'
</script>

<Header />

<main>
	<slot />
</main>

<style>
main {
	@apply
		px-4;
}
</style>
