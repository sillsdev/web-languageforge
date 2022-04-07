<script>
import Header from '$lib/Header.svelte'
</script>

<Header />

<main>
	<slot />
</main>

<style>
main {
	padding-left: 1rem;
	padding-right: 1rem;
}
</style>
