<script>
	export let danger = false
	export let outlined = false
	export let small = false
</script>

<!-- https://daisyui.com/components/button -->
<button on:click class:danger class:outlined class:small class='btn btn-primary'>
	<slot />
</button>

<style>
.danger { @apply
	btn-error;
}

.outlined { @apply
	btn-outline;
}

.small { @apply
	btn-sm;
}
</style>
