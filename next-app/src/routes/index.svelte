<script>
import { throwError } from '$lib/error';
import { GET } from '$lib/fetch'
import { start, stop } from '$lib/progress'
</script>

<h1>LFNext app</h1>

<section>
	<h2>Migrated capabilities</h2>
	<a href=/password/change sveltekit:prefetch>Change password</a>
</section>

<section>
	<h2>Progress indicator</h2>
	<button on:click={() => start('index.svelte')}>start progress</button>
	<button on:click={() => stop('index.svelte')}>stop progress</button>
</section>

<section>
	<h2>Error handling — client</h2>

	<button on:click={() => globalThis.whatIsTheAirspeedVelocityOfAnUnladenSwallow() }>Cause run-time error</button>
	<button on:click={async () => await GET('//LFAPP') }>Cause network error</button>
	<button on:click={() => throwError("sorry, that's not a good password") }>Cause biz logic error</button>
	<button on:click={async () => await GET('//httpbin.org/status/500') }>Cause backend error</button>
</section>

<style>
section {
	padding-top: 1rem;
	padding-bottom: 1rem;
}
</style>
