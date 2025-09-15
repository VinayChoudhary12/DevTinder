const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");

const uploadRouter = express.Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(__dirname, "../../uploads");
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const userId = req.user._id;
		const ext = path.extname(file.originalname || "");
		cb(null, `${userId}-${Date.now()}${ext || ".jpg"}`);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
		if (allowed.includes(file.mimetype)) return cb(null, true);
		cb(new Error("Only image files (JPG, PNG, GIF, WebP) are allowed!"));
	},
});

uploadRouter.post("/upload/profile-photo", userAuth, (req, res) => {
	upload.single("photo")(req, res, async (err) => {
		try {
			if (err instanceof multer.MulterError) {
				return res.status(400).json({ message: err.message });
			} else if (err) {
				return res.status(400).json({ message: err.message });
			}
			if (!req.file) {
				return res.status(400).json({ message: "No file uploaded." });
			}
			const user = await User.findById(req.user._id);
			if (!user) return res.status(404).json({ message: "User not found" });

			// delete old local photo if previously saved
			if (user.photoUrl && user.photoUrl.startsWith("/api/uploads/")) {
				const oldPath = path.join(
					__dirname,
					"../../",
					user.photoUrl.replace("/api/", "")
				);
				if (fs.existsSync(oldPath)) {
					try {
						fs.unlinkSync(oldPath);
					} catch {}
				}
			}

			const filename = path.basename(req.file.filename);
			user.photoUrl = `/api/uploads/${filename}`;
			await user.save();
			return res.json({
				message: "Profile photo uploaded successfully",
				data: user,
			});
		} catch (e) {
			return res.status(500).json({ message: e.message });
		}
	});
});

module.exports = uploadRouter;
