import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnection, removeConnection } from "../utils/connectionSlice";
import Avatar from "./Avatar";
import Chat from "./Chat";

const Connections = () => {
	const connections = useSelector((store) => store.connection);
	const dispatch = useDispatch();
	const [selectedUser, setSelectedUser] = useState(null);
	const [showChat, setShowChat] = useState(false);
	const [chats, setChats] = useState([]);
	const [unreadMessages, setUnreadMessages] = useState({});

	const fetchConnections = async () => {
		try {
			dispatch(removeConnection());
			const connections = await axios.get(BASE_URL + "/user/connections", {
				withCredentials: true,
			});
			dispatch(addConnection(connections.data.data));
		} catch (error) {
			console.log(error);
		}
	};

	const fetchChats = async () => {
		try {
			const response = await axios.get(`${BASE_URL}/chats`, {
				withCredentials: true,
			});
			console.log("Connections received chats:", response.data);
			setChats(response.data || []);

			// Create unread message count mapping
			const unreadCounts = {};
			response.data.forEach((chat) => {
				unreadCounts[chat.participant._id] = chat.unreadCount || 0;
				console.log(`Unread count for ${chat.participant.firstName}: ${chat.unreadCount || 0}`);
			});
			setUnreadMessages(unreadCounts);
			console.log("Final unreadMessages state:", unreadCounts);
		} catch (error) {
			console.error("Failed to fetch chats:", error);
		}
	};

	useEffect(() => {
		fetchConnections();
		fetchChats();
	}, []);

	const handleChatClick = (connection) => {
		// Clear the unread count for this user
		setUnreadMessages((prev) => ({
			...prev,
			[connection._id]: 0,
		}));
		setSelectedUser(connection);
		setShowChat(true);
	};

	const closeChat = () => {
		setShowChat(false);
		setSelectedUser(null);
		// Refresh chats after closing
		fetchChats();
	};

	if (!connections) return;

	if (connections.length === 0)
		return (
			<div className="hero min-h-[60vh] bg-base-200 rounded-2xl">
				<div className="hero-content text-center">
					<div className="max-w-md">
						<div className="text-6xl mb-4">🤝</div>
						<h1 className="text-4xl font-bold mb-4">No Connections Yet</h1>
						<p className="py-6 opacity-80">
							Start swiping to make connections with other developers!
						</p>
					</div>
				</div>
			</div>
		);

	return (
		<>
			<div className="my-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						Your Connections
					</h1>
					<p className="text-lg opacity-80 mt-2">
						{connections.length} developer{connections.length !== 1 ? "s" : ""}{" "}
						connected
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{connections.map((connection) => {
						const {
							_id,
							firstName,
							lastName,
							photoUrl,
							age,
							gender,
							about,
							skills,
						} = connection;

						return (
							<div
								key={_id}
								className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300"
							>
								<div className="card-body p-6">
									{/* Profile Section */}
									<div className="flex items-center gap-4 mb-4">
										<Avatar
											firstName={firstName}
											lastName={lastName}
											photoUrl={photoUrl}
											size="w-16 h-16"
											textSize="text-lg"
											className="border-2 border-primary"
										/>
										<div className="flex-1">
											<h2 className="card-title text-xl">
												{firstName} {lastName}
											</h2>
											{age && gender && (
												<div className="badge badge-outline badge-sm">
													{age}, {gender}
												</div>
											)}
										</div>
										{/* Chat Button - Top Right */}
										<button
											onClick={() => handleChatClick(connection)}
											className="btn btn-primary btn-sm btn-circle shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 relative"
											title={`Chat with ${firstName}`}
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
													d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
												/>
											</svg>
											{/* Unread Message Badge */}
											{unreadMessages[_id] > 0 && (
												<div className="badge badge-error badge-xs absolute -top-1 -right-1 text-white font-bold">
													{unreadMessages[_id]}
												</div>
											)}
										</button>
									</div>

									{/* About Section */}
									{about && (
										<p className="text-sm text-base-content/80 line-clamp-2 mb-4">
											{about}
										</p>
									)}

									{/* Skills Section */}
									{skills && skills.length > 0 && (
										<div className="mb-4">
											<div className="flex flex-wrap gap-1">
												{skills.slice(0, 3).map((skill, index) => (
													<span
														key={index}
														className="badge badge-xs badge-primary badge-outline"
													>
														{String(skill).trim()}
													</span>
												))}
												{skills.length > 3 && (
													<span className="badge badge-xs badge-ghost">
														+{skills.length - 3}
													</span>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Chat Modal */}
			{showChat && selectedUser && (
				<Chat targetUser={selectedUser} onClose={closeChat} />
			)}
		</>
	);
};

export default Connections;
