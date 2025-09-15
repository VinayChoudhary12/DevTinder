const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");
const { membershipAmount } = require("../utils/constants");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
	try {
		const { membershipType } = req.body;
		const { firstName, lastName, emailId } = req.user;

        // Diagnostics: ensure keys are loaded as expected
        const redactedKey = (process.env.RAZORPAY_KEY_ID || "").slice(0, 8) + "********";
        console.log("[Payment] Creating order:", {
            membershipType,
            usingMock: Boolean(razorpayInstance.__mock),
            keyIdPrefix: redactedKey,
        });

		const order = await razorpayInstance.orders.create({
			amount: membershipAmount[membershipType] * 100,
			currency: "INR",
			receipt: "receipt#1",
			notes: {
				firstName,
				lastName,
				emailId,
				membershipType: membershipType,
			},
		});

		// Save it in my database
		console.log(order);

		const payment = new Payment({
			userId: req.user._id,
			orderId: order.id,
			status: order.status,
			amount: order.amount,
			currency: order.currency,
			receipt: order.receipt,
			notes: order.notes,
		});

		const savedPayment = await payment.save();

		// Return back my order details to frontend
		res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        console.error("/payment/create error", err?.message, err?.statusCode || "", err?.error || "");
		return res.status(500).json({ msg: err?.error?.description || err?.message || "Payment init failed" });
	}
});

// Webhook is handled centrally in app.js via raw-body middleware and
// `routes/paymentWebhook.js`. Do not add a webhook route here to avoid
// duplicate handlers that would break signature validation.

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
	const user = req.user.toJSON();
	console.log(user);
	if (user.isPremium) {
		return res.json({ ...user });
	}
	return res.json({ ...user });
});

module.exports = paymentRouter;
