<script lang=ts>
	import {
		Button,
		Form,
		Input,
	} from '$lib/forms'
	import PageHeader from '$lib/PageHeader.svelte'
	import { error } from '$lib/error'
    import type { ActionData } from './$types'

	export let form: ActionData

	let new_password = ''
	let new_password_confirm = ''

	$: if (form?.failed) {
		$error = Error(form.failed)
	}
</script>

<svelte:head>
	<title>Change your password</title>
</svelte:head>

<section class='mx-auto max-w-lg'>
	<PageHeader>
		Change your password
	</PageHeader>

	<Form>
		<Input label='New password:' name=new_password type=password bind:value={ new_password } required autofocus />
		<Input label='Confirm new password:' name=new_password_confirm type=password bind:value={ new_password_confirm } required />

		<Button>Change my password</Button>
	</Form>
</section>
