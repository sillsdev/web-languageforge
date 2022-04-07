<script>
import { change } from '$lib/data/password'

let data = null
let new_password = ''
let new_password_confirm = ''

async function change_password_chatty() {
    data = await change(new_password, new_password_confirm)
}

async function change_password_sleek() {
    const response = await fetch('/password', {
        method: 'put',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            new_password,
            new_password_confirm
        })
    })

    data = await response.json()
}
</script>

<h1>LFNext app - Change password</h1>

<form on:submit|preventDefault={() => {}}>
    <input type=password bind:value={new_password}         placeholder="New password" />
    <input type=password bind:value={new_password_confirm} placeholder="Repeat new password" />

    <button on:click|preventDefault={change_password_sleek}>Change my password (sleek)</button>
    <button on:click|preventDefault={change_password_chatty}>Change my password (chatty)</button>
</form>

<pre>{JSON.stringify(data, null, 2)}</pre>
