import adapter from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'

const yellow = message => `\x1b[33m${message}\x1b[0m`

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),
	},
}
