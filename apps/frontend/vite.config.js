import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
		strictPort: true,
		proxy: {
			"/api": {
				target: "http://localhost:7777",
				changeOrigin: true,
				secure: false,
			},
			"/socket.io": {
				target: "http://localhost:7777",
				ws: true,
			},
		},
	},
});
