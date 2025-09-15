const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

const router = express.Router();

// Passport serialization (required for sessions, even if session: false)
passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (error) {
		done(error, null);
	}
});

// Determine the correct URLs based on environment
const WEB_APP_URL = process.env.WEB_APP_URL || "http://localhost:5173";
const BACKEND_BASE_URL =
	process.env.BACKEND_BASE_URL || "http://localhost:7777";

const hasGoogleCreds =
	Boolean(process.env.GOOGLE_CLIENT_ID) &&
	Boolean(process.env.GOOGLE_CLIENT_SECRET);

if (hasGoogleCreds) {
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL:
					process.env.GOOGLE_CALLBACK_URL ||
					`${BACKEND_BASE_URL}/api/auth/google/callback`,
			},
			async function (accessToken, refreshToken, profile, done) {
				try {
					const email =
						profile.emails && profile.emails[0] && profile.emails[0].value;
					const firstName = profile.name?.givenName || "";
					const lastName = profile.name?.familyName || "";
					const photo =
						profile.photos && profile.photos[0] && profile.photos[0].value;

					if (!email) {
						return done(new Error("No email found in Google profile"), null);
					}

					// Check if user exists by email or googleId
					let user = await User.findOne({
						$or: [{ emailId: email }, { googleId: profile.id }],
					});

					if (!user) {
						// Create new user (real user, not seed)
						user = new User({
							firstName,
							lastName,
							emailId: email,
							authProvider: "google",
							googleId: profile.id,
							photoUrl: photo,
							password: "OAuth_Google_Placeholder_123!aA",
							isSeed: false, // Explicitly mark as real user
						});
						await user.save();
					} else if (user.authProvider !== "google") {
						// Update existing local user to link with Google
						user.authProvider = "google";
						user.googleId = profile.id;
						if (!user.photoUrl && photo) {
							user.photoUrl = photo;
						}
						await user.save();
					}

					return done(null, user);
				} catch (e) {
					console.error("Google OAuth error:", e);
					return done(e, null);
				}
			}
		)
	);
}

router.get("/auth/google", (req, res, next) => {
	if (!hasGoogleCreds) {
		return res.status(503).json({ message: "Google OAuth not configured" });
	}

	// Store the original URL for redirecting after OAuth
	if (req.query.returnTo) {
		req.session = req.session || {};
		req.session.returnTo = req.query.returnTo;
	}

	return passport.authenticate("google", {
		scope: ["profile", "email"],
		session: false,
	})(req, res, next);
});

router.get(
	"/auth/google/callback",
	(req, res, next) => {
		if (!hasGoogleCreds) {
			return res.redirect(WEB_APP_URL + "/login");
		}
		return passport.authenticate("google", {
			failureRedirect: WEB_APP_URL + "/login",
			session: false,
		})(req, res, next);
	},
	async (req, res) => {
		try {
			const isProduction = process.env.NODE_ENV === "production";
			const token = await req.user.getJWT();

			// Set cookie with appropriate settings
			res.cookie("token", token, {
				expires: new Date(Date.now() + 8 * 3600000), // 8 hours
				httpOnly: true,
				sameSite: isProduction ? "none" : "lax",
				secure: isProduction,
				domain: isProduction ? undefined : "localhost", // Let browser handle domain in production
			});

			// Get return URL from session or use default
			const returnTo = (req.session && req.session.returnTo) || "/feed";

			if (!isProduction) {
				// Cookie is already set, just redirect to homepage
				// The frontend will detect the authentication via the cookie
				return res.redirect(WEB_APP_URL + "/");
			}

			// Redirect to the appropriate page
			return res.redirect(WEB_APP_URL + returnTo);
		} catch (e) {
			console.error("OAuth callback error:", e);
			return res.redirect(WEB_APP_URL + "/login?error=oauth_failed");
		}
	}
);

module.exports = router;
