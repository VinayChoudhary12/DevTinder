const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			minLength: 4,
			maxLength: 50,
		},
		lastName: {
			type: String,
		},
		emailId: {
			type: String,
			lowercase: true,
			required: true,
			unique: true,
			trim: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("Invalid email address: " + value);
				}
			},
		},
		password: {
			type: String,
			required: function () {
				return this.authProvider !== "google";
			},
			validate(value) {
				if (this.authProvider === "google") return true;
				if (!validator.isStrongPassword(value)) {
					throw new Error("Enter a Strong Password: " + value);
				}
			},
		},
		age: {
			type: Number,
			min: 18,
		},
		gender: {
			type: String,
			enum: {
				values: ["male", "female", "other"],
				message: `{VALUE} is not a valid gender type`,
			},
			// validate(value) {
			//   if (!["male", "female", "others"].includes(value)) {
			//     throw new Error("Gender data is not valid");
			//   }
			// },
		},
		isPremium: {
			type: Boolean,
			default: false,
		},
		membershipType: {
			type: String,
		},
		isSeed: {
			type: Boolean,
			default: false,
		},
		photoUrl: {
			type: String,
			default: function () {
				if (this.gender === "female") {
					return "https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?w=256&h=256&fit=crop&auto=format";
				}
				if (this.gender === "male") {
					return "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=256&h=256&fit=crop&auto=format";
				}
				return "https://images.unsplash.com/photo-1548932813-1ff6aa1e0a02?w=256&h=256&fit=crop&auto=format";
			},
			validate(value) {
				// Allow local API-served uploads like /api/uploads/<file>
				if (typeof value === "string" && value.startsWith("/api/uploads/")) {
					return true;
				}
				if (!validator.isURL(value)) {
					throw new Error("Invalid Photo URL: " + value);
				}
			},
		},
		authProvider: {
			type: String,
			enum: ["local", "google"],
			default: "local",
		},
		googleId: {
			type: String,
		},
		about: {
			type: String,
			default:
				"Software developer passionate about building innovative solutions with modern technologies",
		},
		skills: {
			type: [String],
		},
	},
	{
		timestamps: true,
	}
);

userSchema.methods.getJWT = async function () {
	const user = this;

	const secret = process.env.JWT_SECRET || "DEV@Tinder$790";
	const token = await jwt.sign({ _id: user._id }, secret, {
		expiresIn: "7d",
	});

	return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
	const user = this;
	const passwordHash = user.password;

	const isPasswordValid = await bcrypt.compare(
		passwordInputByUser,
		passwordHash
	);

	return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
