<script>
	import Error from '$lib/error/Error.svelte'
	import Progress from '$lib/progress/Progress.svelte'
</script>

<!-- https://daisyui.com/components/navbar -->
<header class='navbar bg-primary text-primary-content'>
	<span class='navbar-start ml-4 text-lg md:text-3xl tracking-wider'>
		Language  Forge
	</span>

	<a href=/app rel=external class='navbar-end mr-4 text-primary-content text-xs md:text-sm'>
		back to my projects
	</a>
</header>

<Error />

<Progress />
