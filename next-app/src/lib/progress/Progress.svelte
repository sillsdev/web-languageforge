<script>
	import { loading } from '$lib/progress'

	let value = 0

	$: $loading ? start() : stop()

	let intervalId = 0;
	function start() {
		intervalId = setInterval(() => {
			value += 0.1

			if (value >= 1) {
				value = 0
			}

		}, 100)
	}
	function stop() {
		clearInterval(intervalId)

		value = 0
	}
</script>

<progress {value} class:visible={$loading} class:invisible={!$loading} />
<!-- TODO: watch for https://github.com/saadeghi/daisyui/issues/605 -->

<style>
progress { @apply
	progress
	progress-secondary

	w-screen

	relative
	-top-4;
}
</style>
