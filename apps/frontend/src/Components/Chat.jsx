import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSelector } from "react-redux";
import Avatar from "./Avatar";

const Chat = ({ targetUser, onClose }) => {
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const messagesEndRef = useRef(null);
	const currentUser = useSelector((store) => store.user);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		fetchChat();
	}, [targetUser._id]);

	const fetchChat = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`${BASE_URL}/chat/${targetUser._id}`, {
				withCredentials: true,
			});
			setMessages(response.data.messages || []);
		} catch (error) {
			console.error("Failed to fetch chat:", error);
		} finally {
			setLoading(false);
		}
	};

	const sendMessage = async (e) => {
		e.preventDefault();
		if (!newMessage.trim() || sending) return;

		setSending(true);
		const messageToSend = newMessage;
		setNewMessage(""); // Clear immediately for better UX

		try {
			const response = await axios.post(
				`${BASE_URL}/chat/${targetUser._id}`,
				{ text: messageToSend },
				{ withCredentials: true }
			);

			// Add the new message to the state
			setMessages(response.data.chat.messages || []);
		} catch (error) {
			console.error("Failed to send message:", error);
			// Restore message on error
			setNewMessage(messageToSend);
		} finally {
			setSending(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage(e);
		}
	};

	const formatTime = (timestamp) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = (now - date) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});
		} else if (diffInHours < 48) {
			return "Yesterday";
		} else {
			return date.toLocaleDateString();
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
			<div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl h-full sm:h-[600px] max-h-[90vh] flex flex-col border border-base-300 mx-2 sm:mx-0">
				{/* Chat Header */}
				<div className="flex items-center justify-between p-3 sm:p-4 border-b border-base-300 bg-base-50">
					<div className="flex items-center gap-3 min-w-0 flex-1">
						<Avatar
							firstName={targetUser.firstName}
							lastName={targetUser.lastName}
							photoUrl={targetUser.photoUrl}
							size="w-10 h-10 sm:w-12 sm:h-12"
							textSize="text-sm sm:text-lg"
						/>
						<div className="min-w-0 flex-1">
							<h3 className="font-semibold text-base sm:text-lg truncate">
								{targetUser.firstName} {targetUser.lastName}
							</h3>
							<p className="text-xs sm:text-sm text-base-content/70 truncate">
								{targetUser.about?.substring(0, 40) || "Connected"}
								{targetUser.about?.length > 40 && "..."}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="btn btn-ghost btn-circle btn-sm flex-shrink-0 ml-2"
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
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Messages Area */}
				<div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
					{loading ? (
						<div className="flex justify-center items-center h-full">
							<div className="loading loading-spinner loading-lg"></div>
						</div>
					) : messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center">
							<div className="text-6xl mb-4">💬</div>
							<h3 className="text-xl font-semibold mb-2">
								Start a conversation
							</h3>
							<p className="text-base-content/70">
								Send your first message to {targetUser.firstName}
							</p>
						</div>
					) : (
						messages.map((message, index) => {
							const isCurrentUser = message.senderId._id === currentUser._id;
							return (
								<div
									key={index}
									className={`flex ${
										isCurrentUser ? "justify-end" : "justify-start"
									}`}
								>
									<div
										className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-2xl ${
											isCurrentUser
												? "bg-primary text-primary-content"
												: "bg-base-200 text-base-content"
										}`}
									>
										<p className="text-sm break-words">{message.text}</p>
										<p
											className={`text-xs mt-1 ${
												isCurrentUser
													? "text-primary-content/70"
													: "text-base-content/50"
											}`}
										>
											{formatTime(message.createdAt)}
										</p>
									</div>
								</div>
							);
						})
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Message Input */}
				<form
					onSubmit={sendMessage}
					className="p-3 sm:p-4 border-t border-base-300 bg-base-50"
				>
					<div className="flex gap-2 sm:gap-3 items-end">
						<div className="flex-1 relative">
							<textarea
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder={`Type a message to ${targetUser.firstName}...`}
								className="textarea textarea-bordered w-full resize-none focus:textarea-primary min-h-[2.5rem] max-h-24 py-3 pr-12 text-sm sm:text-base"
								disabled={sending}
								rows="1"
								style={{
									scrollbarWidth: "thin",
								}}
								maxLength={500}
							/>
							<div className="absolute right-3 bottom-3 text-xs text-base-content/50">
								{newMessage.length > 0 && `${newMessage.length}/500`}
							</div>
						</div>
						<button
							type="submit"
							disabled={!newMessage.trim() || sending}
							className="btn btn-primary btn-circle btn-sm sm:btn-md shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex-shrink-0"
							title="Send message (Enter)"
						>
							{sending ? (
								<div className="loading loading-spinner loading-xs sm:loading-sm"></div>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 sm:h-5 sm:w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
									/>
								</svg>
							)}
						</button>
					</div>
					<div className="text-xs text-base-content/50 mt-2 text-center hidden sm:block">
						Press Enter to send • Shift+Enter for new line
					</div>
				</form>
			</div>
		</div>
	);
};

export default Chat;
