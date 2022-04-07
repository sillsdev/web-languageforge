<script>
import { goto } from '$app/navigation'
import { UPDATE } from '$lib/fetch/client'
import Form from '$lib/Form.svelte'

let new_password = ''
let new_password_confirm = ''

async function change_password() {
	await UPDATE('/password.json', {
		password: new_password,
		password_confirm: new_password_confirm
	})

	goto('/password/changed')
}

const autofocus = node => node.focus()
</script>

<svelte:head>
	<title>Change your password</title>
</svelte:head>

<h1>Change your password</h1>

<Form on:submit={change_password}>
	<label>
		New password:
		<input type=password bind:value={new_password} required use:autofocus />
	</label>

    <label>
		Repeat new password:
		<input type=password bind:value={new_password_confirm} required />
	</label>

    <button>Change my password</button>
</Form>

<style>
label {
	display: block;
}
label:not(:first-child) {
	margin-top: 1em;
}
button {
	margin-top: 1em;
	padding: 0.5rem;

	background-color: var(--color-primary);
	color: var(--color-primary-text);
}
</style>
