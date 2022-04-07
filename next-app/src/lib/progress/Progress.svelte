<script>
	import { loading } from '$lib/progress'
</script>

<progress  class:visible={$loading} class:invisible={!$loading} />

<style>
progress { @apply
	progress
	progress-secondary

	w-screen

	relative
	-top-4;
}
</style>
