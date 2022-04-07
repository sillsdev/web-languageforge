<script>
import Header from '$lib/Header.svelte'
</script>

<Header />

<main>
	<slot />
</main>


<style>
main {
	padding: 1rem;
}
</style>
