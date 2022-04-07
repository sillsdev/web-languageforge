<script>
import { throwError } from '$lib/error'
import { GET } from '$lib/fetch/client'
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
	<h2>Error handling</h2>

	<h3>Client</h3>
	<button on:click={ () => globalThis.whatIsTheAirspeedVelocityOfAnUnladenSwallow() }>Cause run-time error</button>
	<button on:click={ async () => await GET('//LFAPP') }>Cause network error</button>
	<button on:click={ () => throwError("sorry, that's not a good password") }>Cause biz logic error</button>
	<button on:click={ async () => await GET('//httpbin.org/status/500') }>Cause backend error</button>

	<h3>Server</h3>
	The change password page has a few options:
	<ul>
		<li>Submit the form without supplying anything</li>
		<li>Only supply the password and not the confirm</li>
		<li>Try to submit the form without being authenticated</li>
	</ul>
</section>

<style>
section {
	padding-top: 1rem;
	padding-bottom: 1rem;
}
</style>
