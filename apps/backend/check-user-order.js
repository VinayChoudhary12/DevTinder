const mongoose = require("mongoose");
const User = require("./src/models/user");

async function checkUserOrder() {
	try {
		console.log("🔄 Connecting to database...");

		const DB_CONNECTION_SECRET =
			process.env.DB_CONNECTION_SECRET ||
			"mongodb+srv://aryanjstar3:WY9uDHCSDf9ZJeqN@cluster0.xnxqru3.mongodb.net/devtinder?retryWrites=true&w=majority&appName=Cluster0";

		await mongoose.connect(DB_CONNECTION_SECRET);
		console.log("✅ Connected to database");

		// Check current user order
		const users = await User.find({})
			.select("firstName lastName isSeed createdAt authProvider")
			.sort({
				isSeed: 1, // false/null first, then true
				createdAt: -1, // newest first within each group
			})
			.limit(10);

		console.log("📋 Current user order:");
		users.forEach((user, index) => {
			const type = user.isSeed ? "SEED" : "REAL";
			const auth = user.authProvider || "local";
			const date = user.createdAt.toLocaleDateString();
			console.log(
				`${index + 1}. ${type} (${auth}) - ${user.firstName} ${
					user.lastName
				} - ${date}`
			);
		});

		// Check if there are recent Google users
		const recentGoogleUsers = await User.find({
			authProvider: "google",
			createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
		}).select("firstName lastName createdAt");

		console.log(
			`\n🔍 Recent Google signups (last 24h): ${recentGoogleUsers.length}`
		);
		recentGoogleUsers.forEach((user) => {
			console.log(`- ${user.firstName} ${user.lastName} - ${user.createdAt}`);
		});
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await mongoose.connection.close();
		process.exit(0);
	}
}

checkUserOrder();
