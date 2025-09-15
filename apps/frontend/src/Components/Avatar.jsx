import { useState } from "react";
import { BASE_URL } from "../utils/constants";

const Avatar = ({
	firstName = "",
	lastName = "",
	photoUrl = "",
	size = "w-16 h-16",
	textSize = "text-lg",
	onClick,
	className = "",
}) => {
	const [imageError, setImageError] = useState(false);

	const getInitials = () => {
		const firstInitial = firstName?.charAt(0)?.toUpperCase() || "";
		const lastInitial = lastName?.charAt(0)?.toUpperCase() || "";
		return `${firstInitial}${lastInitial}` || "U";
	};

	const getAvatarColor = () => {
		const colors = [
			"bg-gradient-to-br from-red-400 to-red-600",
			"bg-gradient-to-br from-blue-400 to-blue-600",
			"bg-gradient-to-br from-green-400 to-green-600",
			"bg-gradient-to-br from-purple-400 to-purple-600",
			"bg-gradient-to-br from-pink-400 to-pink-600",
			"bg-gradient-to-br from-indigo-400 to-indigo-600",
			"bg-gradient-to-br from-yellow-400 to-yellow-600",
			"bg-gradient-to-br from-teal-400 to-teal-600",
		];
		const name = `${firstName}${lastName}`.toLowerCase();
		const hash = name.split("").reduce((acc, char) => {
			return char.charCodeAt(0) + ((acc << 5) - acc);
		}, 0);
		return colors[Math.abs(hash) % colors.length];
	};

	const handleImageError = () => {
		setImageError(true);
	};

	// Handle both local uploads (/api/uploads/) and external URLs
	let processedPhotoUrl = photoUrl;
	if (photoUrl && photoUrl.startsWith("/api/uploads/")) {
		// For local uploads, construct the full URL
		processedPhotoUrl = `${BASE_URL.replace("/api", "")}/api/uploads/${photoUrl
			.split("/")
			.pop()}`;
	}

	const shouldShowImage =
		processedPhotoUrl && !imageError && processedPhotoUrl !== "";

	return (
		<div
			className={`${size} rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${className}`}
			onClick={onClick}
		>
			{shouldShowImage ? (
				<img
					src={processedPhotoUrl}
					alt={`${firstName} ${lastName}`}
					className="w-full h-full object-cover"
					onError={handleImageError}
				/>
			) : (
				<div
					className={`w-full h-full flex items-center justify-center ${getAvatarColor()} text-white font-bold ${textSize} shadow-inner`}
				>
					{getInitials()}
				</div>
			)}
		</div>
	);
};

export default Avatar;
