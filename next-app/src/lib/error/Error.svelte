<script>
	import { beforeNavigate } from '$app/navigation'
	import { error, dismiss } from '$lib/error'
	import { ErrorIcon } from '$lib/icons'

	beforeNavigate(dismiss)
</script>

{#if $error?.message}
	<!-- https://daisyui.com/components/alert -->
	<aside class='alert alert-error shadow-lg w-auto absolute top-0 z-10'>
		<ErrorIcon />

		<span>{ $error.message }</span>

		<button on:click={ dismiss } class='btn btn-ghost'>
			Dismiss
		</button>
	</aside>
{/if}
