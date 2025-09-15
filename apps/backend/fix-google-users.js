const mongoose = require("mongoose");
const User = require("./src/models/user");

async function fixGoogleUsers() {
	try {
		console.log("🔄 Connecting to database...");

		const DB_CONNECTION_SECRET =
			process.env.DB_CONNECTION_SECRET ||
			"mongodb+srv://username:password@cluster0.xnxqru3.mongodb.net/devtinder?retryWrites=true&w=majority&appName=Cluster0";

		await mongoose.connect(DB_CONNECTION_SECRET);
		console.log("✅ Connected to database");

		// Find Google users
		const googleUsers = await User.find({
			authProvider: "google",
		}).select("firstName lastName authProvider isSeed createdAt");

		console.log(`📊 Found ${googleUsers.length} Google users:`);
		googleUsers.forEach((user, index) => {
			console.log(
				`${index + 1}. ${user.firstName} ${user.lastName} - isSeed: ${
					user.isSeed
				}, created: ${user.createdAt}`
			);
		});

		// Ensure Google users are marked as real users (isSeed: false)
		const updateResult = await User.updateMany(
			{ authProvider: "google" },
			{ isSeed: false }
		);

		console.log(
			`✅ Updated ${updateResult.modifiedCount} Google users to isSeed: false`
		);

		// Also update their creation time to be more recent (for testing)
		const recentTime = new Date();
		await User.updateMany(
			{ authProvider: "google" },
			{ createdAt: recentTime }
		);

		console.log(`✅ Updated Google users' creation time to: ${recentTime}`);

		// Test the sorting
		const sortedUsers = await User.find({})
			.select("firstName lastName isSeed createdAt authProvider")
			.sort({
				isSeed: 1, // Real users first
				createdAt: -1, // Newest first
			})
			.limit(10);

		console.log("\n📋 New user order (should show Google users first):");
		sortedUsers.forEach((user, index) => {
			const type = user.isSeed ? "SEED" : "REAL";
			const auth = user.authProvider || "local";
			console.log(
				`${index + 1}. ${type} (${auth}) - ${user.firstName} ${user.lastName}`
			);
		});
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await mongoose.connection.close();
		process.exit(0);
	}
}

fixGoogleUsers();
