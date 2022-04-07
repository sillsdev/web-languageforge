<script>
import Progress from '$lib/progress/Progress.svelte'
</script>

<header>
	<h1>Language Forge</h1>
</header>

<Progress />

<style>
header {
	background-color: var(--color-primary);
	color: var(--color-primary-text);

	min-height: 4rem;
	width: 100vw;
	padding-left: 1rem;
	padding-right: 1rem;

	display: flex;
	flex-direction: row;
	align-items: center;
}
</style>
