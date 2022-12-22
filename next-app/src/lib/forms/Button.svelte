<script>
	export let danger = false
	export {clazz as class}

	let clazz = ''
</script>

<!-- https://daisyui.com/components/button -->
<button on:click class:danger class='btn btn-primary { clazz }'>
	<slot />
</button>

<style>
.danger { @apply
	btn-error;
}
</style>
