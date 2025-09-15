import { Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import PaymentModal from "./PaymentModal";
import { BASE_URL } from "../utils/constants";

const Landing = () => {
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const user = useSelector((store) => store.user);

	const handleGetStarted = () => {
		if (user) {
			// User is authenticated, scroll to how-it-works section
			document.getElementById("how-it-works")?.scrollIntoView({
				behavior: "smooth",
			});
		} else {
			// User is not authenticated, redirect to login
			window.location.href = "/login";
		}
	};

	const handlePaymentSuccess = (paymentResponse) => {
		console.log("Payment successful:", paymentResponse);
		alert("Thank you for your support! ☕");
	};

	const handleCoffeePayment = async () => {
		try {
			// Create order for coffee (₹99)
			const response = await fetch(`${BASE_URL}/payment/create`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ membershipType: "coffee" }),
			});

			if (!response.ok) {
				throw new Error("Failed to create payment order");
			}

			const { orderId, amount, currency, keyId } = await response.json();

			// Razorpay options
			const options = {
				key: keyId,
				amount: amount,
				currency: currency,
				name: "DevTinder",
				description: "Buy me a coffee ☕ - Support the developer!",
				order_id: orderId,
				handler: function (response) {
					console.log("Payment successful:", response);
					alert("Thank you for your support! ☕ Your coffee means a lot!");
				},
				prefill: {
					name: "DevTinder User",
					email: "user@devtinder.com",
				},
				theme: {
					color: "#F59E0B",
				},
			};

			// Check if Razorpay is loaded
			if (typeof window.Razorpay === "undefined") {
				alert("Payment system is not loaded. Please refresh the page.");
				return;
			}

			const rzp = new window.Razorpay(options);
			rzp.open();
		} catch (error) {
			console.error("Payment error:", error);
			alert("Payment failed. Please try again later.");
		}
	};
	return (
		<div className="space-y-12">
			<section className="hero min-h-[60vh] rounded-2xl bg-mesh-gradient">
				<div className="hero-content flex-col lg:flex-row-reverse gap-8">
					<div className="relative max-w-md w-full">
						<div className="absolute -inset-2 rounded-3xl blur-2xl opacity-40 bg-gradient-to-tr from-primary via-secondary to-accent"></div>
						<img
							src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
							className="relative w-full rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]"
							alt="developers collaborating"
						/>
					</div>
					<div>
						<h1 className="text-5xl font-bold">DevTinder</h1>
						<p className="py-6 opacity-80">
							Swipe, match and collaborate with developers. Find teammates for
							hackathons, side-projects and startups. Built by developers, for
							developers.
						</p>
						<div className="flex gap-3">
							<button onClick={handleGetStarted} className="btn btn-primary">
								Get Started
							</button>
							<a href="#how-it-works" className="btn btn-ghost">
								Learn more
							</a>
							{/** Buy me a coffee moved below; removed from hero */}
						</div>
					</div>
				</div>
			</section>

			<section id="how-it-works" className="rounded-2xl bg-base-100 p-6">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-4">How DevTinder Works</h2>
					<p className="text-lg opacity-80">
						Connect with developers in just three simple steps
					</p>
				</div>
				<div className="grid md:grid-cols-3 gap-6">
					<div className="card bg-base-200 p-6 h-full flex flex-col">
						<div className="text-center mb-4">
							<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-white font-bold text-xl">1</span>
							</div>
							<h3 className="text-xl font-semibold">Create Profile</h3>
						</div>
						<div className="flex-grow">
							<p className="opacity-80 text-center">
								Add your programming skills, tech stack, project interests, and
								what kind of collaboration you're looking for. Upload your best
								photo and write a compelling bio that showcases your developer
								journey.
							</p>
						</div>
					</div>
					<div className="card bg-base-200 p-6 h-full flex flex-col">
						<div className="text-center mb-4">
							<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-white font-bold text-xl">2</span>
							</div>
							<h3 className="text-xl font-semibold">Swipe & Match</h3>
						</div>
						<div className="flex-grow">
							<p className="opacity-80 text-center">
								Explore curated developer profiles based on your preferences.
								Swipe right on developers whose skills complement yours or who
								share similar project interests. When both developers like each
								other, it's a match!
							</p>
						</div>
					</div>
					<div className="card bg-base-200 p-6 h-full flex flex-col">
						<div className="text-center mb-4">
							<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-white font-bold text-xl">3</span>
							</div>
							<h3 className="text-xl font-semibold">Collaborate</h3>
						</div>
						<div className="flex-grow">
							<p className="opacity-80 text-center">
								Start conversations with your matches, discuss project ideas,
								share GitHub repos, and plan your next big collaboration.
								Whether it's a hackathon team, startup co-founder, or side
								project partner - build something amazing together!
							</p>
						</div>
					</div>
				</div>
			</section>

			<section id="coffee" className="rounded-2xl bg-base-200 p-0 mt-10">
				<div className="relative overflow-hidden rounded-2xl">
					<div className="absolute -inset-6 blur-2xl opacity-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500" />
					<div className="relative p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
						<div className="flex-1 text-center lg:text-left">
							<h3 className="text-2xl sm:text-3xl font-bold">
								Buy me a coffee
							</h3>
							<p className="opacity-80 mt-2 text-sm lg:text-base">
								Support the project and future features.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center w-full lg:w-auto">
							<button
								onClick={handleCoffeePayment}
								className="btn btn-primary btn-md sm:btn-lg w-full sm:w-auto"
							>
								Buy me a coffee ☕
							</button>
							<div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-2 sm:mt-0">
								<a
									className="btn btn-xs sm:btn-sm btn-outline"
									href="https://aryanjaiswal.me"
									target="_blank"
									rel="noreferrer"
								>
									Portfolio
								</a>
								<a
									className="btn btn-xs sm:btn-sm btn-outline"
									href="https://linkedin.com/in/aryanjstar"
									target="_blank"
									rel="noreferrer"
								>
									LinkedIn
								</a>
								<a
									className="btn btn-xs sm:btn-sm btn-outline"
									href="https://github.com/aryanjstar"
									target="_blank"
									rel="noreferrer"
								>
									GitHub
								</a>
								<a
									className="btn btn-xs sm:btn-sm btn-outline"
									href="https://x.com/aryanjstar"
									target="_blank"
									rel="noreferrer"
								>
									Twitter
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Landing;
