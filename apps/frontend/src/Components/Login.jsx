import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
	const [emailId, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [isLoginFrom, setIsLoginForm] = useState(true);
	const [error, setError] = useState("");
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	// Check for OAuth errors on component mount
	useEffect(() => {
		const errorParam = searchParams.get("error");
		if (errorParam === "oauth_failed") {
			setError("OAuth authentication failed. Please try again.");
		}
	}, [searchParams]);

	const handleLogin = async () => {
		try {
			const res = await axios.post(
				BASE_URL + "/login",
				{
					emailId,
					password,
				},
				{ withCredentials: true }
			);
			// Backend returns the user object directly
			dispatch(addUser(res.data));
			return navigate("/");
		} catch (err) {
			const msg = err?.response?.data || err?.message || "Login failed";
			setError(String(msg));
			console.log(err);
		}
	};

	const handleGoogle = () => {
		// Clear any existing errors
		setError("");
		// Redirect to Google OAuth
		window.location.href = BASE_URL + "/auth/google";
	};

	const handleSignUp = async () => {
		try {
			const res = await axios.post(
				BASE_URL + "/signup",
				{
					firstName,
					lastName,
					emailId,
					password,
				},
				{
					withCredentials: true,
				}
			);
			dispatch(addUser(res.data.data));
			return navigate("/profile");
		} catch (error) {
			const msg = error?.response?.data || error?.message || "Signup failed";
			setError(String(msg));
			console.log(error);
		}
	};

	return (
		<div className="flex justify-center my-10">
			<div className="card bg-base-300 w-96 shadow-xl">
				<div className="card-body">
					<h2 className="card-title justify-center">
						{isLoginFrom ? "Login" : "Signup"}
					</h2>
					<div>
						{!isLoginFrom && (
							<>
								<label className="form-control w-full max-w-xs my-2">
									<div className="label">
										<span className="label-text">Firstname</span>
									</div>
									<input
										type="text"
										value={firstName}
										onChange={(e) => setFirstName(e.target.value)}
										className="input input-bordered w-full max-w-xs"
									/>
								</label>
								<label className="form-control w-full max-w-xs my-2">
									<div className="label">
										<span className="label-text">Lastname</span>
									</div>
									<input
										type="text"
										value={lastName}
										onChange={(e) => setLastName(e.target.value)}
										className="input input-bordered w-full max-w-xs"
									/>
								</label>
							</>
						)}
						<label className="form-control w-full max-w-xs my-2">
							<div className="label">
								<span className="label-text">Email</span>
							</div>
							<input
								type="text"
								value={emailId}
								onChange={(e) => setEmail(e.target.value)}
								className="input input-bordered w-full max-w-xs"
							/>
						</label>
						<label className="form-control w-full max-w-xs my-2">
							<div className="label">
								<span className="label-text">Password</span>
							</div>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="input input-bordered w-full max-w-xs"
							/>
						</label>
					</div>
					<p className="text-red-500 text-center">{error}</p>
					<div className="card-actions justify-center mt-2">
						<button
							className="btn btn-primary"
							onClick={isLoginFrom ? handleLogin : handleSignUp}
						>
							{isLoginFrom ? "Login" : "Signup"}
						</button>
					</div>
					<div className="divider">OR</div>
					<div className="card-actions justify-center mt-2">
						<button className="btn btn-outline gap-2" onClick={handleGoogle}>
							<svg className="w-5 h-5" viewBox="0 0 24 24">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Continue with Google
						</button>
					</div>
					<p
						className=" text-center cursor-pointer py-2"
						onClick={() => setIsLoginForm((value) => !value)}
					>
						{isLoginFrom
							? "New user ? signup here"
							: "Existing User ? Login here"}
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
