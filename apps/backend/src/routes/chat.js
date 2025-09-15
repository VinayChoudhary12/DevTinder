const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
	const { targetUserId } = req.params;
	const userId = req.user._id;

	try {
		let chat = await Chat.findOne({
			participants: { $all: [userId, targetUserId] },
		}).populate({
			path: "messages.senderId",
			select: "firstName lastName photoUrl",
		});
		if (!chat) {
			chat = new Chat({
				participants: [userId, targetUserId],
				messages: [],
				lastSeen: new Map(),
			});
			await chat.save();
		} else {
			// Mark as read - update lastSeen timestamp for current user
			chat.lastSeen.set(userId.toString(), new Date());
			await chat.save();
		}
		res.json(chat);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Failed to fetch chat" });
	}
});

// Send a message
chatRouter.post("/chat/:targetUserId", userAuth, async (req, res) => {
	const { targetUserId } = req.params;
	const userId = req.user._id;
	const { text } = req.body;

	try {
		if (!text || text.trim() === "") {
			return res.status(400).json({ message: "Message text is required" });
		}

		let chat = await Chat.findOne({
			participants: { $all: [userId, targetUserId] },
		});

		if (!chat) {
			chat = new Chat({
				participants: [userId, targetUserId],
				messages: [],
			});
		}

		chat.messages.push({
			senderId: userId,
			text: text.trim(),
		});

		await chat.save();

		// Populate the latest message for response
		await chat.populate({
			path: "messages.senderId",
			select: "firstName lastName photoUrl",
		});

		res.json({
			message: "Message sent successfully",
			chat: chat,
			latestMessage: chat.messages[chat.messages.length - 1],
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Failed to send message" });
	}
});

// Get all chats for a user
chatRouter.get("/chats", userAuth, async (req, res) => {
	const userId = req.user._id;

	try {
		const chats = await Chat.find({
			participants: userId,
			messages: { $exists: true, $not: { $size: 0 } }, // Only chats with messages
		})
			.populate({
				path: "participants",
				select: "firstName lastName photoUrl",
				match: { _id: { $ne: userId } }, // Exclude current user
			})
			.populate({
				path: "messages.senderId",
				select: "firstName lastName",
			})
			.sort({ "messages.createdAt": -1 }); // Sort by latest message

		// Filter out chats where the other participant is null (deleted users)
		const validChats = chats.filter(
			(chat) => chat.participants.length > 0 && chat.participants[0] !== null
		);

		// Calculate unread message counts for each chat
		const chatsWithUnreadCount = validChats.map((chat) => {
			const userLastSeen = chat.lastSeen?.get(userId.toString());
			console.log(`\n=== Chat ${chat._id} ===`);
			console.log(`User ${userId} lastSeen:`, userLastSeen);
			console.log(`Total messages:`, chat.messages.length);

			// Count unread messages (messages sent after user's lastSeen timestamp)
			let unreadCount = 0;
			if (userLastSeen) {
				const unreadMessages = chat.messages.filter((message) => {
					const isFromOther = message.senderId._id.toString() !== userId.toString();
					const isAfterLastSeen = message.createdAt > userLastSeen;
					console.log(`Message from ${message.senderId._id} at ${message.createdAt}: isFromOther=${isFromOther}, isAfterLastSeen=${isAfterLastSeen}`);
					return isFromOther && isAfterLastSeen;
				});
				unreadCount = unreadMessages.length;
				console.log(`Unread messages (after lastSeen):`, unreadCount);
			} else {
				// If user has never seen this chat, all messages from others are unread
				const unreadMessages = chat.messages.filter(
					(message) => message.senderId._id.toString() !== userId.toString()
				);
				unreadCount = unreadMessages.length;
				console.log(`Unread messages (never seen):`, unreadCount);
			}

			return {
				_id: chat._id,
				participant: chat.participants[0],
				latestMessage: chat.messages[chat.messages.length - 1],
				unreadCount: unreadCount,
			};
		});

		// Return all chats with their unread counts (frontend will handle filtering)
		res.json(chatsWithUnreadCount);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Failed to fetch chats" });
	}
});

module.exports = chatRouter;
