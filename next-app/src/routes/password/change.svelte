<script>
import { UPDATE } from '$lib/fetch'

let data = null
let new_password = ''
let new_password_confirm = ''

async function change_password() {
	data = await UPDATE('/password.json', {
		password: new_password,
		password_confirm: new_password_confirm
	})
}
</script>

<h1>LFNext app - Change password</h1>

<form on:submit|preventDefault={change_password}>
    <input type=password bind:value={new_password}         placeholder="New password" />
    <input type=password bind:value={new_password_confirm} placeholder="Repeat new password" />

    <button>Change my password</button>
</form>

{#if data}
    <pre>{JSON.stringify(data, null, 2)}</pre>
{/if}
