const {
	validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const Payment = require("../models/payment");
const User = require("../models/user");

module.exports = async function paymentWebhookHandler(req, res) {
	try {
		const rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : "";
		const webhookSignature = req.get("X-Razorpay-Signature");
		console.log("[Razorpay] Webhook hit", {
			hasSignature: Boolean(webhookSignature),
			length: rawBody?.length,
		});

		const isWebhookValid = validateWebhookSignature(
			rawBody,
			webhookSignature,
			process.env.RAZORPAY_WEBHOOK_SECRET
		);

		if (!isWebhookValid) {
			console.log("[Razorpay] Invalid webhook signature");
			return res.status(400).json({ msg: "Webhook signature is invalid" });
		}
		console.log("[Razorpay] Valid webhook signature");

		const payload = JSON.parse(rawBody);
		const paymentDetails = payload.payload.payment.entity;

		const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
		if (payment) {
			payment.status = paymentDetails.status;
			await payment.save();
			const user = await User.findOne({ _id: payment.userId });
			if (user) {
				user.isPremium = true;
				user.membershipType = payment.notes?.membershipType;
				await user.save();
			}
		}

		console.log("[Razorpay] Webhook processed successfully");
		return res.status(200).json({ msg: "Webhook received successfully" });
	} catch (err) {
		console.error("[Razorpay] Webhook handler error", err?.message);
		return res.status(200).json({ msg: "Webhook received" });
	}
};
