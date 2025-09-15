// Prefer explicit env; fallback to local proxy during dev
export const BASE_URL =
	typeof window !== "undefined" &&
	window.location.hostname.endsWith("web.core.windows.net")
		? import.meta.env.VITE_API_BASE_URL || "/api"
		: import.meta.env.VITE_API_BASE_URL || "/api";
