import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";

const ChatList = () => {
	const [chats, setChats] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showBadge, setShowBadge] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		fetchChats();

		// Check if notifications were recently viewed
		const lastViewed = localStorage.getItem("chatNotificationsViewed");
		if (lastViewed) {
			const viewedTime = parseInt(lastViewed);
			const now = Date.now();
			// Hide badge if viewed within last 5 minutes
			if (now - viewedTime < 5 * 60 * 1000) {
				setShowBadge(false);
			}
		}
	}, []);

	const fetchChats = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`${BASE_URL}/chats`, {
				withCredentials: true,
			});
			console.log("ChatList received chats:", response.data);
			setChats(response.data || []);
		} catch (error) {
			console.error("Failed to fetch chats:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleChatClick = () => {
		// Mark notifications as viewed and hide badge
		localStorage.setItem("chatNotificationsViewed", Date.now().toString());
		setShowBadge(false);
		navigate("/connections");
	};

	return (
		<button
			onClick={handleChatClick}
			className="btn btn-ghost btn-circle btn-sm sm:btn-md relative"
			title="View Messages"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-5 w-5 sm:h-6 sm:w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
				/>
			</svg>
			{(() => {
				const totalUnread = chats.reduce(
					(total, chat) => total + (chat.unreadCount || 0),
					0
				);
				return (
					totalUnread > 0 &&
					showBadge && (
						<div className="badge badge-primary badge-xs absolute -top-1 -right-1">
							{totalUnread}
						</div>
					)
				);
			})()}
		</button>
	);
};

export default ChatList;
