<script>
import { loading } from '$lib/progress'
</script>

<progress class:show={$loading} class:hide={!$loading} />

<style>
progress {
	width: 100%;
	position: relative;
	top: -0.6rem;
}

.hide {
	visibility: hidden;
}
.show {
	visibility: visible;
}
</style>
