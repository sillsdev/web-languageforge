import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-node'

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter(),
	prerender: {
		onError: 'continue',
	},
  },

  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
}
