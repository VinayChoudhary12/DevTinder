import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import PaymentModal from "./PaymentModal";

const PremiumStatus = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showPaymentModal, setShowPaymentModal] = useState(false);

	useEffect(() => {
		fetchUserStatus();
	}, []);

	const fetchUserStatus = async () => {
		try {
			const response = await axios.get(`${BASE_URL}/premium/verify`, {
				withCredentials: true,
			});
			setUser(response.data);
		} catch (error) {
			console.error("Failed to fetch user status:", error);
		} finally {
			setLoading(false);
		}
	};

	const handlePaymentSuccess = (paymentResponse) => {
		console.log("Payment successful:", paymentResponse);
		// Refresh user status
		fetchUserStatus();
		// Show success message
		alert("Payment successful! Your premium features are now active.");
	};

	if (loading) {
		return (
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<div className="animate-pulse">
						<div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
						<div className="h-4 bg-base-300 rounded w-1/2"></div>
					</div>
				</div>
			</div>
		);
	}

	const membershipTypes = {
		coffee: {
			name: "Coffee Supporter",
			icon: "☕",
			color: "text-amber-600",
			bgColor: "bg-amber-50",
			description: "Thank you for supporting us!"
		},
		silver: {
			name: "Silver Member",
			icon: "🥈",
			color: "text-gray-600",
			bgColor: "bg-gray-50",
			description: "Premium features unlocked"
		},
		gold: {
			name: "Gold Member",
			icon: "🥇",
			color: "text-yellow-600",
			bgColor: "bg-yellow-50",
			description: "Full premium experience"
		}
	};

	return (
		<>
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<h2 className="card-title flex items-center gap-2">
						<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.5 2.5L19 4" />
						</svg>
						Premium Status
					</h2>

					{user?.isPremium ? (
						<div className={`p-4 rounded-lg ${membershipTypes[user.membershipType]?.bgColor || 'bg-primary/10'}`}>
							<div className="flex items-center gap-3 mb-2">
								<span className="text-2xl">
									{membershipTypes[user.membershipType]?.icon || "⭐"}
								</span>
								<div>
									<h3 className={`font-bold ${membershipTypes[user.membershipType]?.color || 'text-primary'}`}>
										{membershipTypes[user.membershipType]?.name || "Premium Member"}
									</h3>
									<p className="text-sm text-base-content/70">
										{membershipTypes[user.membershipType]?.description || "Premium features active"}
									</p>
								</div>
							</div>

							<div className="flex flex-wrap gap-2 mt-3">
								{user.membershipType === 'gold' && (
									<>
										<div className="badge badge-success">Ad-free</div>
										<div className="badge badge-success">Super likes</div>
										<div className="badge badge-success">Profile boost</div>
										<div className="badge badge-success">Read receipts</div>
									</>
								)}
								{(user.membershipType === 'silver' || user.membershipType === 'gold') && (
									<>
										<div className="badge badge-primary">Priority support</div>
										<div className="badge badge-primary">Advanced filters</div>
										<div className="badge badge-primary">See who liked you</div>
									</>
								)}
								{user.membershipType === 'coffee' && (
									<div className="badge badge-accent">Supporter</div>
								)}
							</div>
						</div>
					) : (
						<div className="text-center py-6">
							<div className="text-6xl mb-4">💎</div>
							<h3 className="font-bold text-lg mb-2">Unlock Premium Features</h3>
							<p className="text-base-content/70 mb-4">
								Get access to advanced features, priority support, and help support the platform!
							</p>
							<button
								onClick={() => setShowPaymentModal(true)}
								className="btn btn-primary btn-wide"
							>
								Upgrade Now
							</button>
						</div>
					)}

					{user?.isPremium && (
						<div className="card-actions justify-end mt-4">
							<button
								onClick={() => setShowPaymentModal(true)}
								className="btn btn-outline btn-sm"
							>
								Upgrade Further
							</button>
						</div>
					)}
				</div>
			</div>

			<PaymentModal
				isOpen={showPaymentModal}
				onClose={() => setShowPaymentModal(false)}
				onSuccess={handlePaymentSuccess}
			/>
		</>
	);
};

export default PremiumStatus;
