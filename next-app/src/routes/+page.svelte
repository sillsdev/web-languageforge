<script>
	import { browser } from '$app/environment'
    import Details from '$lib/Details.svelte'
	import { GET } from '$lib/fetch'
	import { Button, Input, Form } from '$lib/forms'
    import PageHeader from '$lib/PageHeader.svelte'
	import { start, stop } from '$lib/progress'
	import Stats from '$lib/Stats.svelte'
	import { onMount } from 'svelte'

	let dark_mode = false
	let value = 'default_value'
	const stats = [
		{
			title: 'Stat one hundred thousand',
			value: 100_000,
		},
		{
			title: 'Stat two hundred thousand',
			value: 200_000,
		},
		{
			title: 'Stat three hundred thousand',
			value: 300_000,
		},
		{
			title: 'Stat four hundred thousand',
			value: 400_000,
		},
		{
			title: 'Stat five hundred thousand',
			value: 500_000,
		},
	]
	let items = [
		{
			name: 'item 1',
			prop: 'prop 1',
			number: 1,
		},
		{
			name: 'it 2',
			prop: 'property 2',
			number: 22,
		},
		{
			name: 'itm 3',
			prop: 'prp 3',
			number: 333,
		},
		{
			name: 'item 4',
			prop: 'propty 4',
			number: 4444,
		},
		{
			name: 'item 5',
			prop: 'proprty 5',
			number: 55555,
		},
		{
			name: 'item item item item 6',
			prop: 'proprty proprty proprty 6',
			number: 6,
		},
		{
			name: 'item 7',
			prop: 'property 7',
			number: 77777777777,
		},
	]

	onMount(() => dark_mode = window.matchMedia('(prefers-color-scheme: dark)').matches)

	$: browser && document.documentElement.setAttribute('data-theme', dark_mode ? 'dark' : 'light')

	function sort_items_by(field) {
		items = items.sort((a, b) => a[field] < b[field] ? 1 : -1)
	}
</script>

<div class='drawer'>
	<input type=checkbox class=drawer-toggle id=left_drawer>

	<div class=drawer-content>
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
			<Button on:click={ () => {throw Error("sorry, that's not a good password")} } danger>Cause biz logic error</Button>
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
			<Stats {stats} />

			<h3>Drawer</h3>
			<label for=left_drawer class='btn btn-primary drawer-button'>Open left drawer</label>
		</section>

		<section>
			<h2>Custom components</h2>

			<h3>Button</h3>
			<Button>primary</Button>
			<Button danger>error</Button>
			<Button class='btn-outline'>outline</Button>
			<Button class='btn-xs sm:btn-sm'>extra small</Button>

			<h3>Details</h3>
			<Details>
				<div slot=summary>
					<span class=pr-4>Favorite book of the Bible?</span>
					<Button on:click={() => alert('Saved')} danger>Save changes</Button>
				</div>

				Job
			</Details>

			<h3>Form</h3>
			<p>Intended to remove some biolerplate and provide some consistent layout</p>
			<Form>
				<Input name=default label=default />

				<Button>primary</Button>
			</Form>

			<h3>Input</h3>
			<Input name=default label=default />
			<Input name=password label=password type=password />
			<Input name=value label=value bind:value /> <span>{value}</span>

			<h3>PageHeader</h3>
			<PageHeader>Simple</PageHeader>
			<PageHeader>
				<span class='flex justify-between items-center'>
					elements spread across header

					<a href='/'>link to this page</a>
				</span>
			</PageHeader>
		</section>
	</div>

	<div class='drawer-side not-prose'>
		<label for=left_drawer class=drawer-overlay />

		<ul class='menu p-4 w-fit bg-base-100 text-base-content'>
			<li class='menu-title grid grid-cols-3'>
				<span on:click={ () => sort_items_by('name') } on:keydown={ () => sort_items_by('name') } class='cursor-pointer w-fit'>Name</span>
				<span on:click={ () => sort_items_by('prop') } on:keydown={ () => sort_items_by('prop') } class='cursor-pointer w-fit'>Prop</span>
				<span on:click={ () => sort_items_by('number') } on:keydown={ () => sort_items_by('number') } class='cursor-pointer w-fit'>Number</span>
			</li>

			<hr class='mt-2 mb-4'>

			{#each items as { name, prop, number }, i (i)}
				<li>
					<a class='grid grid-cols-3' href='/'>
						<span>{ name }</span>
						<span>{ prop }</span>
						<span>{ number }</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>
