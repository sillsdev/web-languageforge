<script>
import Error from '$lib/error/Error.svelte'
import Progress from '$lib/progress/Progress.svelte'

</script>

<header>
	<h1>Language Forge</h1>

	<Error />
</header>

<Progress />

<style>
header {
	background-color: var(--agnostic-primary);
	color: var(--agnostic-light);

	min-height: 4rem;
	width: 100vw;
	padding-left: 1rem;
	padding-right: 1rem;

	display: flex;
	flex-direction: row;
	align-items: center;
}

h1 {
	padding-right: 2rem;
}
</style>
