<script>
	export let danger = false
	export let disabled = false
	export {clazz as class}

	let clazz = ''
</script>

<!-- https://daisyui.com/components/button -->
<button on:click class:btn-error={danger} class:btn-disabled={disabled} class='btn btn-primary { clazz }'>
	<slot />
</button>
