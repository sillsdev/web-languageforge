<script>
	import { onMount } from 'svelte'

	export let label = ''
	export let type = 'text'
	export let value = ''
	export let required = false
	export let autofocus = false

	let id = randomId()
	let input = {}

	onMount(autofocusIfRequested)

	function randomId() {
		return Math.random().toString(36).substring(2, 7)
	}

	function autofocusIfRequested() {
		autofocus && input.focus()
	}

	// works around "svelte(invalid-type)" warning, i.e., can't have a dynamic type AND bind:value...keep an eye on https://github.com/sveltejs/svelte/issues/3921
	function typeWorkaround(node) {
		node.type = type
	}
</script>

<label for={id}>
	<span>{label}</span>
</label>

<input {id} use:typeWorkaround bind:value {required} bind:this={input} />

<style>
	/* https://daisyui.com/components/input */
	label { @apply
		label;
	}
	label > span { @apply
		label-text;
	}
	input { @apply
		input
		input-bordered;
	}
</style>
