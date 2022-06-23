<script>
	export let danger = false
	let classes = ''
	export { classes as class }
</script>

<!-- https://daisyui.com/components/button -->
<button on:click class:danger class='btn btn-primary { classes }'>
	<slot />
</button>

<style>
.danger { @apply
	btn-error;
}
</style>
