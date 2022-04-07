<form on:submit|preventDefault novalidate>
	<slot />
</form>

<style>
	form { @apply
		form-control;
	}
	:global(form > input) { @apply
		mb-6;
	}
	:global(form > button) { @apply
		mt-2;
	}
</style>
