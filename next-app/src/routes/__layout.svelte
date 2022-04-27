<script>
	import { page } from '$app/stores'
	import '$lib/app.css'
	import Header from '$lib/Header.svelte'

	// TODO: add 'active menu item' class to current page

	let checked = false

	function open() {
		checked = true
	}

	function close() {
		checked = false
	}
</script>

<!-- https://daisyui.com/components/drawer -->
<div class='drawer drawer-end'>
	<input type=checkbox {checked} class=drawer-toggle>

	<div class=drawer-content>
		<Header on:menuopen={open} />

		<main class=px-6>
			<slot />
		</main>
	</div>

	<div class=drawer-side on:click={close}>
	  <div class=drawer-overlay></div>

	  <!-- https://daisyui.com/components/menu  -->
	  <ul class='menu bg-base-100'>
		<li class=menu-title>User</li>
		<li><a href=/app/userprofile rel=external>My profile</a></li>
		<li><a href=/password/change>Change password</a></li>
		<li><a href=/app/siteadmin rel=external>Site administration</a></li>
		<li><a href=/auth/logout rel=external>Logout</a></li>

		<li class=menu-title>Project</li>
		<li><a href=/app rel=external>My projects</a></li>

		<li class=menu-title>About</li>
		<li><a href=https://community.software.sil.org/t/w/5454 rel=external>What's new</a></li>
		<li><a href='https://www.youtube.com/playlist?list=PLJLUPwIFOI8d8lmQVAcBapyw87jCtmDNA' rel=external>Videos</a></li>
		<li><a href=https://github.com/sillsdev/web-languageforge/wiki/Known-Issues-and-Limitations rel=external>Known issues and limitations</a></li>

		<li class=menu-title>Help</li>
		<li><a href=https://community.software.sil.org/c/language-forge rel=external>Community Support</a></li>
		<li><a href=mailto:issues@languageforge.org rel=external>Report a Problem (email issues@languageforge.org)</a></li>
	  </ul>
	</div>
  </div>

<style>
	ul {
		width: 33%;
	}
</style>
