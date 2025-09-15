import axios from "axios";
import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user, showActions = true }) => {
	const dispatch = useDispatch();
	const { _id, firstName, lastName, age, gender, about, photoUrl, skills } =
		user;
	const [imageError, setImageError] = useState(false);

	const handleSendRequest = async (status, userId) => {
		try {
			const res = await axios.post(
				BASE_URL + "/request/send/" + status + "/" + userId,
				{},
				{
					withCredentials: true,
				}
			);
			dispatch(removeUserFromFeed(userId));
		} catch (error) {
			console.log(error);
		}
	};

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
		<div className="card bg-gradient-to-br from-base-100 to-base-200 w-full shadow-2xl hover:shadow-3xl transition-all duration-300 border border-base-300 flex flex-col min-h-[500px] max-w-sm mx-auto rounded-2xl overflow-hidden">
			<div className="relative">
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10 rounded-t-2xl"></div>
				<figure className="relative h-64 bg-gradient-to-br from-primary/10 to-secondary/10 flex-shrink-0 overflow-hidden rounded-t-2xl">
					{shouldShowImage ? (
						<img
							src={processedPhotoUrl}
							alt={`${firstName} ${lastName}`}
							className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
							style={{
								objectPosition: "center 30%", // Better positioning for face visibility
							}}
							onError={handleImageError}
						/>
					) : (
						<div
							className={`w-full h-full flex items-center justify-center ${getAvatarColor()} text-white font-bold text-6xl shadow-inner hover:scale-105 transition-transform duration-300`}
						>
							{getInitials()}
						</div>
					)}
					{/* Subtle overlay for better text readability */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
				</figure>
			</div>

			{/* Content */}
			<div className="card-body gap-3 p-4 flex-grow flex flex-col">
				{/* Name and basic info */}
				<div className="text-center space-y-2">
					<h2 className="card-title text-2xl font-bold justify-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						{firstName} {lastName}
					</h2>
					{age && gender && (
						<div className="badge badge-outline badge-lg">
							{age}, {gender}
						</div>
					)}
				</div>

				{/* About section */}
				{about && (
					<>
						<div className="flex items-center mt-2 mb-3">
							<div className="flex-grow h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
							<div className="px-3 text-sm font-semibold text-primary bg-base-100">
								About
							</div>
							<div className="flex-grow h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
						</div>
						<p className="text-center leading-relaxed text-base-content/80 text-sm line-clamp-3">
							{about}
						</p>
					</>
				)}

				{/* Skills section */}
				{skills && skills.length > 0 && (
					<div className="flex-1">
						<div className="flex items-center mt-2 mb-3">
							<div className="flex-grow h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
							<div className="px-3 text-sm font-semibold text-primary bg-base-100">
								Skills
							</div>
							<div className="flex-grow h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
						</div>
						<div className="flex flex-wrap gap-2 justify-center">
							{skills.slice(0, 6).map((skill, index) => (
								<span
									key={index}
									className="badge badge-md badge-primary badge-outline hover:badge-primary transition-colors duration-200 px-3 py-2 text-xs font-medium"
								>
									{String(skill).trim()}
								</span>
							))}
							{skills.length > 6 && (
								<span className="badge badge-md badge-ghost px-3 py-2 text-xs font-medium">
									+{skills.length - 6}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Spacer to push buttons to bottom */}
				<div className="flex-grow"></div>

				{/* Action buttons */}
				{showActions && _id !== "preview" && (
					<div className="card-actions justify-center gap-3 mt-4 flex-shrink-0">
						<button
							className="btn btn-sm btn-outline btn-error hover:btn-error hover:scale-105 transition-all duration-200 gap-1 flex-1 max-w-28"
							onClick={() => {
								handleSendRequest("ignored", _id);
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
							PASS
						</button>
						<button
							className="btn btn-sm btn-primary hover:btn-primary hover:scale-105 transition-all duration-200 gap-1 shadow-lg flex-1 max-w-28"
							onClick={() => {
								handleSendRequest("interested", _id);
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								/>
							</svg>
							LIKE
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default UserCard;
