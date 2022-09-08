<script>
	import { loading } from '$lib/progress'
</script>

<progress class:visible={ $loading } class:invisible={ ! $loading } class='progress progress-secondary relative -top-4' />
