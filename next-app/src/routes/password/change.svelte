<script context=module>
	export const prerender = true
</script>

<script>
	import { goto } from '$app/navigation'
	import { UPDATE } from '$lib/fetch/client'
	import {
		Button,
		Form,
		Input,
	} from '$lib/forms'
	import PageHeader from '$lib/PageHeader.svelte'

	let new_password = ''
	let new_password_confirm = ''

	async function change_password() {
		await UPDATE('/password', {
			password: new_password,
			password_confirm: new_password_confirm
		})

		goto('/password/changed')
	}
</script>

<svelte:head>
	<title>Change your password</title>
</svelte:head>

<div class='mx-auto max-w-lg'>
	<PageHeader>
		Change your password
	</PageHeader>

	<Form on:submit={ change_password }>
		<Input label='New password:' type=password bind:value={ new_password } required autofocus />
		<Input label='Confirm new password:' type=password bind:value={ new_password_confirm } required />

		<Button>Change my password</Button>
	</Form>
</div>
