<script lang=ts>
	import {
		Button,
		Form,
		Input,
	} from '$lib/forms'
	import PageHeader from '$lib/PageHeader.svelte'
	import { dismiss, error } from '$lib/error'
	import { debounce } from '$lib/debounce'
	import type { ActionData } from './$types'

	export let form: ActionData

	let new_password = ''
	let new_password_confirm = ''

	$: if (form?.failed) {
		$error = Error(form.failed)
	}

	$: new_password_confirm && debounce(() => verify(new_password_confirm, new_password), 400)

	$: submittable = new_password && new_password_confirm && new_password_confirm === new_password
	$: disabled = ! submittable

	function verify(password_confirm: string, password: string) {
		password_confirm !== password ? $error = Error('Passwords are not the same') : dismiss()
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
		<Input label='Confirm new password:' type=password bind:value={ new_password_confirm } required />

		<Button {disabled}>Change my password</Button>
	</Form>
</section>
