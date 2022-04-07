module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('daisyui'),
	],
	daisyui: {
		themes: [
			{
				'light': {
					...require('daisyui/src/colors/themes')['[data-theme=corporate]'],
					'primary': '#104060',
					'secondary': '#0a2440',
				}
			},
			{
				'dark': {
					...require('daisyui/src/colors/themes')['[data-theme=dark]'],
					'primary': '#0a2440',
					'secondary': '#104060',
				}
			},
		],
	},
}
