import adapter from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'

const yellow = message => `\x1b[33m${message}\x1b[0m`

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),
		prerender: {
			// https://kit.svelte.dev/docs/configuration#prerender
			onError: ({ path, status }) => {
				const externalLinks = [
					'/app',
					'/auth/login',
					'/projects',
				]

				if (externalLinks.some(link => path.startsWith(link))) {
					// :-( https://github.com/sveltejs/kit/issues/3402
					console.warn(yellow(`${status} on ${path}: skipping since it's an external link`))
				} else {
					throw new Error(`${status} error while crawling ${path}`)
				}
			}
		},
	},
}
