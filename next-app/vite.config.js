import { sveltekit } from '@sveltejs/kit/vite'

/** @type {import('vite').UserConfig} */
const config = {
        plugins: [sveltekit()],

		// https://vitejs.dev/config/server-options.html
		server: {
			port: 3000,
			hmr: {
				clientPort: 3000,
			},
		},
		preview: {
			port: 3000,
		},
}

export default config
