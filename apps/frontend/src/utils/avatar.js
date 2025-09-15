export const makeAvatarDataUrl = ({ firstName, lastName, gender }) => {
	const initials =
		`${firstName ? firstName[0] : ""}${
			lastName ? lastName[0] : ""
		}`.toUpperCase() || "DEV";
	const bgColor = "#1e293b"; // slate-800
	const textColor = "#60a5fa"; // blue-400
	const svg = `
    <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0ea5e9"/>
          <stop offset="100%" stop-color="#6366f1"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" fill="url(#g)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="110" font-weight="700">${initials}</text>
    </svg>`;
	return `data:image/svg+xml;base64,${btoa(svg)}`;
};
