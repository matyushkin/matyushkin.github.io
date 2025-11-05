/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				'cm-sans': ['Computer Modern Sans', 'sans-serif'],
			},
		},
	},
	plugins: [require("@tailwindcss/typography"),require("daisyui")],
	daisyui: {
		themes: [
			{
				light: {
					"primary": "#000000",
					"secondary": "#666666",
					"accent": "#000000",
					"neutral": "#eeeeee",
					"base-100": "#ffffff",
					"base-200": "#f5f5f5",
					"base-300": "#eeeeee",
					"info": "#0000ff",
					"success": "#00ff00",
					"warning": "#ffff00",
					"error": "#ff0000",
				},
				dark: {
					"primary": "#ffffdd",
					"secondary": "#ccccaa",
					"accent": "#ffffdd",
					"neutral": "#222222",
					"base-100": "#111111",
					"base-200": "#1a1a1a",
					"base-300": "#222222",
					"info": "#6666ff",
					"success": "#66ff66",
					"warning": "#ffff66",
					"error": "#ff6666",
				},
			},
		],
		darkTheme: "dark",
		logs: false,
	}
}
