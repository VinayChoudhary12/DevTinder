const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const passport = require("passport");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

// Load environment from .env and .env.local (if present)
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({
	path: path.join(__dirname, "../.env.local"),
	override: true,
});

require("./utils/cronjob");

const allowedOrigins = (
	process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5176"
).split(",");
app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	})
);
// Ensure secure cookies work correctly behind Azure's proxy
app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 1000,
});
app.use("/api", apiLimiter);
// For webhook: capture raw body for signature validation
app.use("/api/payment/webhook", express.raw({ type: "*/*" }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");
const oauthRouter = require("./routes/oauth");
const uploadRouter = require("./routes/upload");
let seedMockUsers;
if (process.env.SEED === "true") {
	// Lazy require to avoid pulling @faker-js/faker in production when not used
	({ seedMockUsers } = require("./utils/seed"));
}

// Health check
app.get("/healthz", (req, res) => res.status(200).json({ status: "ok" }));

// API routes (versioned base path)
app.use("/api", authRouter);
app.use("/api", oauthRouter);
app.use("/api", profileRouter);
app.use("/api", requestRouter);
app.use("/api", userRouter);
app.use("/api", uploadRouter);
app.use("/api", chatRouter);

// Feature-flag payments off by default for deployment stability
if (process.env.PAYMENTS_ENABLED === "true") {
	const paymentRouter = require("./routes/payment");
	const paymentWebhookHandler = require("./routes/paymentWebhook");
	app.use("/api", paymentRouter);
	app.post("/api/payment/webhook", paymentWebhookHandler);
}

// serve uploaded images BEFORE 404 handler
app.use(
	"/api/uploads",
	express.static(require("path").join(__dirname, "../uploads"))
);

// 404 for unknown API routes
app.use((req, res, next) => {
	if (req.path.startsWith("/api")) {
		return res.status(404).json({ message: "Not Found" });
	}
	return next();
});

// Generic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ message: "Internal Server Error" });
});

const server = http.createServer(app);
initializeSocket(server);

// On Azure, the platform expects apps to listen on PORT (default 8080)
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

// Always start the HTTP server so Azure health checks succeed even if DB is down
server.listen(PORT, HOST, () => {
	console.log(`HTTP server listening on ${HOST}:${PORT}...`);
});

// Connect to DB asynchronously; do not block server start
connectDB()
	.then(() => {
		console.log("Database connection established...");
		if (process.env.SEED === "true" && typeof seedMockUsers === "function") {
			seedMockUsers(15).then(() => console.log("Mock users seeded"));
		}
	})
	.catch((err) => {
		console.error("Database cannot be connected!!", err?.message);
	});
