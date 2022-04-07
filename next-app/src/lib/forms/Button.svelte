<script>
export let danger = false
</script>

<button on:click class:danger>
	<slot />
</button>

<style>
button {
	@apply
		/* https://daisyui.com/components/button */
		btn
		btn-primary;
}
.danger {
	@apply btn-error;
}
</style>
