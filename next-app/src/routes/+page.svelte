<script>
	import { browser } from '$app/environment'
	import { throw_error } from '$lib/error'
	import { GET } from '$lib/fetch'
	import { Button, Input } from '$lib/forms'
    import PageHeader from '$lib/PageHeader.svelte'
	import { start, stop } from '$lib/progress'
	import Stats from '$lib/stats'
	import { onMount } from 'svelte'

	let dark_mode = false
	let value = 'default_value'

	onMount(() => dark_mode = window.matchMedia('(prefers-color-scheme: dark)').matches)

	$: browser && document.documentElement.setAttribute('data-theme', dark_mode ? 'dark' : 'light')
</script>

<h1>LFNext app</h1>

<section>
	<h2>Migrated capabilities</h2>
	<ol>
		<li><a href=/password/change>Change password</a></li>
		<li><a href=/projects/abc-123>Project landing page</a></li>
	</ol>
</section>

<section>
	<h2>Progress indicator</h2>
	<Button on:click={ () => start('index.svelte') }>start progress</Button>
	<Button on:click={ () => stop('index.svelte') }>stop progress</Button>
</section>

<section>
	<h2>Error handling</h2>

	<h3>Client</h3>
	<Button on:click={ () => globalThis.whatIsTheAirspeedVelocityOfAnUnladenSwallow() } danger>Cause run-time error</Button>
	<Button on:click={ async () => await GET({url: '//LFAPP'}) } danger>Cause network error</Button>
	<Button on:click={ () => throw_error("sorry, that's not a good password", 400) } danger>Cause biz logic error</Button>
	<Button on:click={ async () => await GET({url: '//httpbin.org/status/500'}) } danger>Cause backend error</Button>

	<h3>Server</h3>
	The change password page has a few options:
	<ul>
		<li>Submit the form without supplying anything</li>
		<li>Only supply the password and not the confirm</li>
		<li>Try to submit the form without being authenticated</li>
	</ul>
</section>

<section>
	<h2>UI library <small><a href=//daisyui.com rel=noreferrer target=_blank>//daisyui.com</a></small></h2>

	<h3>Button</h3>
	<button class='btn btn-primary'>primary</button>
	<button class='btn btn-secondary'>secondary</button>
	<button class='btn btn-error'>error</button>
	<button class='btn btn-lg'>large</button>
	<button class='btn' disabled>disabled</button>

	<h3>Light/Dark mode</h3>
	<input type=checkbox bind:checked={ dark_mode } class='toggle toggle-primary toggle-lg'>

	<h3>Stats</h3>
	<Stats>
		<Stats.Stat title='Stat one hundred thousand' value=100,000 />
		<Stats.Stat title='Stat two hundred thousand' value=200,000 />
		<Stats.Stat title='Stat three hundred thousand' value=300,000 />
		<Stats.Stat title='Stat four hundred thousand' value=400,000 />
		<Stats.Stat title='Stat five hundred thousand' value=500,000 />
		<Stats.Stat title='Stat six hundred thousand' value=600,000 />
	</Stats>
</section>

<section>
	<h2>Custom components</h2>

	<h3>Button</h3>
	<Button>primary</Button>
	<Button danger>error</Button>
	<Button class='btn-outline'>outline</Button>
	<Button class='btn-xs sm:btn-sm'>extra small</Button>

	<h3>Input</h3>
	<Input label=default />
	<Input label=password type=password />
	<Input label=value bind:value /> <span>{value}</span>

	<h3>PageHeader</h3>
	<PageHeader>Simple</PageHeader>
	<PageHeader>
		<span class='flex justify-between items-center'>
			elements spread across header

			<a href='/'>link to this page</a>
		</span>
	</PageHeader>
</section>
