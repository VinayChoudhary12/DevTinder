import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
	const [loading, setLoading] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState("coffee");
	const [error, setError] = useState("");

	const plans = {
		coffee: {
			name: "Buy me a Coffee ☕",
			price: 99,
			description: "Support the developer with a coffee!",
			features: ["Show your appreciation", "Help maintain the platform", "Feel good about supporting indie dev"],
			color: "bg-amber-500",
			icon: "☕"
		},
		silver: {
			name: "Silver Membership 🥈",
			price: 300,
			description: "Unlock premium features",
			features: ["Priority support", "Advanced filters", "See who liked you", "Unlimited likes"],
			color: "bg-gray-400",
			icon: "🥈"
		},
		gold: {
			name: "Gold Membership 🥇",
			price: 700,
			description: "Full premium experience",
			features: ["All Silver features", "Boost your profile", "Super likes", "Read receipts", "Ad-free experience"],
			color: "bg-yellow-500",
			icon: "🥇"
		}
	};

	const handlePayment = async () => {
		if (loading) return;
		
		setLoading(true);
		setError("");

		try {
			// Create order
			const response = await axios.post(
				`${BASE_URL}/payment/create`,
				{ membershipType: selectedPlan },
				{ withCredentials: true }
			);

			const { orderId, amount, currency, keyId } = response.data;

			// Razorpay options
			const options = {
				key: keyId,
				amount: amount,
				currency: currency,
				name: "DevTinder",
				description: `${plans[selectedPlan].name} - ${plans[selectedPlan].description}`,
				order_id: orderId,
				handler: function (response) {
					console.log("Payment successful:", response);
					onSuccess(response);
					onClose();
				},
				prefill: {
					name: "DevTinder User",
					email: "user@devtinder.com",
				},
				theme: {
					color: "#F59E0B",
				},
				modal: {
					ondismiss: function () {
						setLoading(false);
					},
				},
			};

			// Check if Razorpay is loaded
			if (typeof window.Razorpay === "undefined") {
				setError("Payment system is not loaded. Please refresh the page.");
				setLoading(false);
				return;
			}

			const rzp = new window.Razorpay(options);
			rzp.open();

		} catch (error) {
			console.error("Payment error:", error);
			setError(error.response?.data?.msg || "Payment failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-base-300">
					<h2 className="text-2xl font-bold text-base-content">Choose Your Plan</h2>
					<button
						onClick={onClose}
						className="btn btn-ghost btn-circle"
						disabled={loading}
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mx-6 mt-4 alert alert-error">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{error}</span>
					</div>
				)}

				{/* Plans */}
				<div className="p-6 space-y-4">
					{Object.entries(plans).map(([planKey, plan]) => (
						<div
							key={planKey}
							className={`card border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
								selectedPlan === planKey 
									? 'border-primary shadow-lg' 
									: 'border-base-300 hover:border-base-400'
							}`}
							onClick={() => setSelectedPlan(planKey)}
						>
							<div className="card-body p-4">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<div className={`w-12 h-12 rounded-full ${plan.color} flex items-center justify-center text-white text-xl font-bold`}>
												{plan.icon}
											</div>
											<div>
												<h3 className="font-bold text-lg">{plan.name}</h3>
												<p className="text-base-content/70">{plan.description}</p>
											</div>
										</div>
										<ul className="space-y-1 text-sm text-base-content/80">
											{plan.features.map((feature, index) => (
												<li key={index} className="flex items-center gap-2">
													<svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
													</svg>
													{feature}
												</li>
											))}
										</ul>
									</div>
									<div className="text-right">
										<div className="text-2xl font-bold text-primary">₹{plan.price}</div>
										<div className="text-sm text-base-content/60">one-time</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="flex justify-between items-center p-6 border-t border-base-300">
					<div className="text-sm text-base-content/60">
						💳 Secure payment powered by Razorpay
					</div>
					<div className="flex gap-3">
						<button
							onClick={onClose}
							className="btn btn-ghost"
							disabled={loading}
						>
							Cancel
						</button>
						<button
							onClick={handlePayment}
							className={`btn btn-primary ${loading ? 'loading' : ''}`}
							disabled={loading}
						>
							{loading ? 'Processing...' : `Pay ₹${plans[selectedPlan].price}`}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PaymentModal;
