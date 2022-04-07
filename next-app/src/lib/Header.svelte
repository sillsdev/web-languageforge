<script>
	import Error from '$lib/error/Error.svelte'
	import Progress from '$lib/progress/Progress.svelte'
</script>

<!-- https://daisyui.com/components/navbar -->
<header class='navbar bg-primary text-primary-content'>
	<span class='navbar-start text-3xl ml-4 tracking-wider'>
		Language  Forge
	</span>

	<a href=/app rel=external class='navbar-end mr-4 text-primary-content text-sm'>
		back to my projects
	</a>
</header>

<Error />

<Progress />
