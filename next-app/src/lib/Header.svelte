<script>
	import Error from '$lib/error/Error.svelte'
	import HamburgerIcon from '$lib/icons/HamburgerIcon.svelte'
	import Progress from '$lib/progress/Progress.svelte'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()
</script>

<!-- https://daisyui.com/components/navbar -->
<header class='navbar bg-primary text-primary-content'>
	<span class='navbar-start ml-4 text-lg md:text-3xl tracking-wider'>
		Language  Forge
	</span>

	<div class=navbar-end>
		<button on:click={ () => dispatch('menuopen') } class='btn btn-primary btn-circle'>
			<HamburgerIcon />
		</button>
	</div>
</header>

<Error />

<Progress />
