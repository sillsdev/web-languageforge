<script lang=ts>
	import { onMount } from 'svelte'

	export let label = ''
	export let type = 'text'
	export let value = ''
	export let required = false
	export let autofocus = false

	let id = randomId()
	let input: HTMLInputElement

	onMount(autofocusIfRequested)

	function randomId() {
		return Math.random().toString(36).substring(2, 7)
	}

	function autofocusIfRequested() {
		autofocus && input?.focus()
	}

	// works around "svelte(invalid-type)" warning, i.e., can't have a dynamic type AND bind:value...keep an eye on https://github.com/sveltejs/svelte/issues/3921
	function typeWorkaround(node: HTMLInputElement) {
		node.type = type
	}
</script>

<!-- https://daisyui.com/components/input -->
<label for={ id } class=label>
	<span class='label-text'>
		{ label }
	</span>
</label>

<input { id } use:typeWorkaround bind:value { required } bind:this={ input } class='input input-bordered' />
