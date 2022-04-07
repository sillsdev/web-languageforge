<script>
import { goto } from '$app/navigation'
import { UPDATE } from '$lib/fetch/client'
import {
	Button,
	Form,
	Input,
} from '$lib/forms'

let new_password = ''
let new_password_confirm = ''

async function change_password() {
	await UPDATE('/password.json', {
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
	<h1>Change your password</h1>

	<Form on:submit={change_password}>
		<Input label='New password:' type=password bind:value={new_password} required autofocus />
		<Input label='Confirm new password:' type=password bind:value={new_password_confirm} required />

		<Button>Change my password</Button>
	</Form>
</div>
