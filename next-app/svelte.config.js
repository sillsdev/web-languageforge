import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-node'

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
				console.info(`skipping ${status} error while crawling ${path} since it's an external link`)
			} else {
				throw new Error(`${status} error while crawling ${path}`)
			}
		}
	},
  },

  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
}
