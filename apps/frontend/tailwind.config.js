/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			backgroundImage: {
				"mesh-gradient":
					"radial-gradient(1200px 600px at -10% -20%, rgba(99,102,241,0.35), transparent), radial-gradient(800px 400px at 110% -10%, rgba(16,185,129,0.35), transparent), radial-gradient(800px 400px at 50% 120%, rgba(236,72,153,0.35), transparent)",
			},
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				devtinderDark: {
					primary: "#5B7CFF",
					secondary: "#3ABFF8",
					accent: "#22D3EE",
					neutral: "#0B1220",
					"base-100": "#0E1628",
					info: "#60A5FA",
					success: "#22C55E",
					warning: "#F59E0B",
					error: "#EF4444",
				},
			},
		],
		logs: false,
	},
};
