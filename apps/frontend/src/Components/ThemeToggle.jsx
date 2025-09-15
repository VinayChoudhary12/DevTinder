import { useEffect } from "react";

const ThemeToggle = () => {
	// Force app theme to the design system (single dark theme)
	useEffect(() => {
		document.documentElement.setAttribute("data-theme", "devtinderDark");
		localStorage.setItem("theme", "devtinderDark");
	}, []);
	return null;
};

export default ThemeToggle;
