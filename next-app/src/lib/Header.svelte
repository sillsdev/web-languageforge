<script>
import Error from '$lib/error/Error.svelte'
import Progress from '$lib/progress/Progress.svelte'

</script>

<header>
	<span>Language  Forge</span>
</header>

<Error />

<Progress />

<style>
header {
	@apply
		/* https://daisyui.com/components/navbar/ */
		navbar
		bg-primary
		text-primary-content

		w-screen

		text-2xl
		font-medium
		tracking-wide;
}
</style>
