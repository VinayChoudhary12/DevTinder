const mongoose = require("mongoose");
const User = require("./src/models/user");

const techBios = [
	"Full-stack developer building React and Node.js applications for startups",
	"Frontend engineer specializing in React, Vue, and modern CSS frameworks",
	"Backend developer creating scalable APIs with Express and MongoDB",
	"DevOps engineer automating deployments with Docker and Kubernetes",
	"Mobile app developer building cross-platform apps with React Native",
	"UI/UX designer creating beautiful interfaces with Figma and modern design systems",
	"Data scientist building ML models with Python and TensorFlow",
	"Cloud architect designing AWS and Azure infrastructure solutions",
	"Cybersecurity engineer protecting web applications and user data",
	"Product manager bridging tech and business in fintech startups",
	"Open source contributor to React, Vue, and JavaScript ecosystem",
	"Tech lead building microservices architecture for e-commerce platforms",
	"Startup founder developing SaaS products with modern tech stack",
	"Software engineer passionate about clean code and test-driven development",
	"Technical writer documenting APIs and creating developer tutorials",
	"Code mentor helping developers learn React, Node.js, and system design",
	"Database engineer optimizing PostgreSQL and MongoDB performance",
	"Frontend architect building component libraries and design systems",
	"Backend engineer developing real-time applications with WebSocket and Redis",
	"Machine learning engineer creating recommendation systems and AI chatbots",
	"Full-stack developer with expertise in MERN stack and cloud deployment",
	"DevOps specialist implementing CI/CD pipelines and infrastructure automation",
	"Software architect designing distributed systems and microservices",
	"AI/ML engineer developing intelligent solutions for business automation",
];

async function fixAllDescriptions() {
	try {
		console.log("🔄 Connecting to database...");

		const DB_CONNECTION_SECRET =
			process.env.DB_CONNECTION_SECRET ||
			"mongodb+srv://aryanjstar3:WY9uDHCSDf9ZJeqN@cluster0.xnxqru3.mongodb.net/devtinder?retryWrites=true&w=majority&appName=Cluster0";

		await mongoose.connect(DB_CONNECTION_SECRET);
		console.log("✅ Connected to database");

		// Find ALL users with problematic descriptions (including Latin lorem ipsum)
		const problematicUsers = await User.find({
			$or: [
				{
					about: {
						$regex:
							/lorem|ipsum|default|ante|trans|sophismata|inflammatio|vorax|adfero|dedecor|pecto|congregatio|architecto/i,
					},
				},
				{ about: "This is a default about of the user!" },
				{
					about: {
						$regex: /^Software developer passionate about building innovative/,
					},
				}, // Even the new default
				{ about: "Hii, Aryan there how are you?" }, // Hardcoded user description
				{
					about: {
						$regex: /^[A-Z][a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+.*/,
					},
				}, // Latin-like patterns
			],
		}).select("firstName lastName about isSeed");

		console.log(
			`📊 Found ${problematicUsers.length} users with problematic descriptions`
		);

		let realUsersFixed = 0;
		let seedUsersFixed = 0;

		// Update each user with a random tech bio
		for (const user of problematicUsers) {
			const randomTechBio =
				techBios[Math.floor(Math.random() * techBios.length)];
			await User.updateOne({ _id: user._id }, { about: randomTechBio });

			if (user.isSeed) {
				seedUsersFixed++;
			} else {
				realUsersFixed++;
			}

			console.log(
				`✅ ${user.isSeed ? "SEED" : "REAL"} - Updated ${user.firstName} ${
					user.lastName
				}: ${randomTechBio.substring(0, 60)}...`
			);
		}

		console.log(`\n🎉 SUCCESS SUMMARY:`);
		console.log(`✅ Fixed ${realUsersFixed} real users (isSeed: false)`);
		console.log(`✅ Fixed ${seedUsersFixed} seed users (isSeed: true)`);
		console.log(`✅ Total: ${problematicUsers.length} users updated`);

		// Verify by checking a few users
		const verifyUsers = await User.find({})
			.select("firstName lastName about isSeed")
			.limit(5);
		console.log(`\n📋 Sample verified users:`);
		verifyUsers.forEach((user, index) => {
			console.log(
				`${index + 1}. ${user.isSeed ? "SEED" : "REAL"} - ${user.firstName} ${
					user.lastName
				}: ${user.about.substring(0, 60)}...`
			);
		});
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await mongoose.connection.close();
		process.exit(0);
	}
}

fixAllDescriptions();
