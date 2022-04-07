<script>
import { onMount } from 'svelte'

onMount(kill_session)

function kill_session() {
	document.cookie = 'PHPSESSID=; max-age=0; path=/'
}
</script>

<svelte:head>
	<title>Password is changed</title>
</svelte:head>

<h1>
	🎉 Your password has been changed! 🎉
</h1>

<p>
	You have been logged out now so you can try your new password by <a rel=external href=/auth/login>logging in</a> again.
</p>
