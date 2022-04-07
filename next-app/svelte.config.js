import adapter from '@sveltejs/adapter-node'

const yellow = message => `\x1b[33m${message}\x1b[0m`

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter(),
		prerender: {
			// https://kit.svelte.dev/docs/configuration#prerender
			onError: ({ path, status }) => {
				const externalLinks = [
					'/auth/login',
				]

				if (externalLinks.includes(path)) {
					// :-( https://github.com/sveltejs/kit/issues/3402
					console.warn(yellow(`${status} on ${path}: skipping since it's an external link`))
				} else {
					throw new Error(`${status} error while crawling ${path}`)
				}
			}
		},
	},
}
