const faker = require("@faker-js/faker").faker;
const User = require("../models/user");

// Curated Indian-looking avatar URLs (15 each)
const MALE_AVATARS = [
	"https://randomuser.me/api/portraits/men/31.jpg",
	"https://randomuser.me/api/portraits/men/32.jpg",
	"https://randomuser.me/api/portraits/men/33.jpg",
	"https://randomuser.me/api/portraits/men/34.jpg",
	"https://randomuser.me/api/portraits/men/35.jpg",
	"https://randomuser.me/api/portraits/men/36.jpg",
	"https://randomuser.me/api/portraits/men/37.jpg",
	"https://randomuser.me/api/portraits/men/38.jpg",
	"https://randomuser.me/api/portraits/men/39.jpg",
	"https://randomuser.me/api/portraits/men/40.jpg",
	"https://randomuser.me/api/portraits/men/41.jpg",
	"https://randomuser.me/api/portraits/men/42.jpg",
	"https://randomuser.me/api/portraits/men/43.jpg",
	"https://randomuser.me/api/portraits/men/44.jpg",
	"https://randomuser.me/api/portraits/men/45.jpg",
];

const FEMALE_AVATARS = [
	"https://randomuser.me/api/portraits/women/31.jpg",
	"https://randomuser.me/api/portraits/women/32.jpg",
	"https://randomuser.me/api/portraits/women/33.jpg",
	"https://randomuser.me/api/portraits/women/34.jpg",
	"https://randomuser.me/api/portraits/women/35.jpg",
	"https://randomuser.me/api/portraits/women/36.jpg",
	"https://randomuser.me/api/portraits/women/37.jpg",
	"https://randomuser.me/api/portraits/women/38.jpg",
	"https://randomuser.me/api/portraits/women/39.jpg",
	"https://randomuser.me/api/portraits/women/40.jpg",
	"https://randomuser.me/api/portraits/women/41.jpg",
	"https://randomuser.me/api/portraits/women/42.jpg",
	"https://randomuser.me/api/portraits/women/43.jpg",
	"https://randomuser.me/api/portraits/women/44.jpg",
	"https://randomuser.me/api/portraits/women/45.jpg",
];

// Indian name pools
const INDIAN_MALE_FIRST_NAMES = [
	"Aarav",
	"Vivaan",
	"Aditya",
	"Vihaan",
	"Arjun",
	"Krish",
	"Rohan",
	"Ishaan",
	"Rudra",
	"Atharv",
	"Dhruv",
	"Ayaan",
	"Kabir",
	"Kartik",
	"Ritik",
];
const INDIAN_FEMALE_FIRST_NAMES = [
	"Aarohi",
	"Ananya",
	"Diya",
	"Ira",
	"Kavya",
	"Myra",
	"Navya",
	"Riya",
	"Saanvi",
	"Sara",
	"Anika",
	"Ishita",
	"Jiya",
	"Tanya",
	"Vaishnavi",
];
const INDIAN_LAST_NAMES = [
	"Sharma",
	"Verma",
	"Gupta",
	"Agarwal",
	"Patel",
	"Iyer",
	"Nair",
	"Reddy",
	"Singh",
	"Yadav",
	"Mehta",
	"Kapoor",
	"Bose",
	"Chatterjee",
	"Mishra",
];

// Professional tech-focused bios - real tech descriptions
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
	"Senior React developer building scalable web applications for enterprise clients",
	"Node.js backend specialist creating high-performance RESTful APIs",
	"Cloud solutions architect specializing in AWS serverless technologies",
	"Frontend developer passionate about responsive design and user experience",
	"Data engineer building ETL pipelines with Python and Apache Spark",
	"Mobile developer creating native iOS and Android applications",
	"DevOps specialist implementing CI/CD pipelines and infrastructure automation",
	"Software architect designing distributed systems and microservices",
	"AI/ML engineer developing intelligent solutions for business automation",
];

async function seedMockUsers(count = 30) {
	const docs = [];
	// Ensure near-equal distribution for male/female
	const half = Math.floor(count / 2);
	const gendersPlanned = [
		...Array(half).fill("male"),
		...Array(count - half).fill("female"),
	];
	let maleIdx = 0;
	let femaleIdx = 0;
	for (let i = 0; i < count; i++) {
		const gender = gendersPlanned[i];
		const firstName =
			gender === "female"
				? faker.helpers.arrayElement(INDIAN_FEMALE_FIRST_NAMES)
				: faker.helpers.arrayElement(INDIAN_MALE_FIRST_NAMES);
		const lastName = faker.helpers.arrayElement(INDIAN_LAST_NAMES);
		const emailId = faker.internet.email({ firstName, lastName }).toLowerCase();
		const skills = faker.helpers.arrayElements(
			[
				"React",
				"Node",
				"Express",
				"MongoDB",
				"GraphQL",
				"AWS",
				"Azure",
				"GCP",
				"Docker",
				"K8s",
				"TypeScript",
				"Tailwind",
			],
			{ min: 3, max: 6 }
		);
		const about = faker.helpers.arrayElement(techBios);
		const age = faker.number.int({ min: 21, max: 40 });
		// Unique photo assignment per gender, cycling through curated lists
		const avatarPool = gender === "female" ? FEMALE_AVATARS : MALE_AVATARS;
		const avatar =
			gender === "female"
				? FEMALE_AVATARS[femaleIdx++ % FEMALE_AVATARS.length]
				: MALE_AVATARS[maleIdx++ % MALE_AVATARS.length];
		docs.push({
			firstName,
			lastName,
			emailId,
			password: "SeedUser_123!aA",
			gender,
			photoUrl: avatar,
			about,
			skills,
			age,
			isSeed: true,
		});
	}
	if (process.env.SEED_PURGE === "true") {
		await User.deleteMany({});
	}
	await User.insertMany(docs, { ordered: false }).catch(() => {});
}

module.exports = { seedMockUsers };
