const Razorpay = require("razorpay");
const crypto = require("crypto");
const path = require("path");
// Ensure env is loaded even if this module is imported before app.js
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({
	path: path.join(__dirname, "../.env.local"),
	override: true,
});

const keyIdFromEnv = (process.env.RAZORPAY_KEY_ID || "").trim();
const keySecretFromEnv = (process.env.RAZORPAY_KEY_SECRET || "").trim();
const hasKeys = Boolean(keyIdFromEnv) && Boolean(keySecretFromEnv);

if (!hasKeys) {
	// Lightweight mock for local/dev when Razorpay keys are absent
	// Avoids crashing server; DO NOT USE IN PRODUCTION
	const mock = {
		__mock: true,
		orders: {
			create: async ({ amount, currency, receipt, notes }) => ({
				id: "order_" + crypto.randomUUID().replace(/-/g, ""),
				status: "created",
				amount,
				currency,
				receipt,
				notes,
			}),
		},
	};
	console.log(
		"[Razorpay] Using MOCK instance (no keys found). This is only for local dev."
	);
	module.exports = mock;
} else {
	const instance = new Razorpay({
		key_id: keyIdFromEnv,
		key_secret: keySecretFromEnv,
	});
	const redacted = keyIdFromEnv.slice(0, 8) + "********";
	console.log(
		`[Razorpay] Initialized with key_id: ${redacted} (secret length: ${keySecretFromEnv.length})`
	);
	module.exports = instance;
}
