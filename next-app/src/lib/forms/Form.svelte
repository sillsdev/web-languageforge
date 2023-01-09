<form on:submit|preventDefault novalidate class='form-control'>
	<slot />
</form>

<style lang=postcss>
	:global(form > input) { @apply
		mb-6;
	}
	:global(form > button) { @apply
		mt-2;
	}
</style>
