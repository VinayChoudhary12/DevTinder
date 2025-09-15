import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { removeFeed } from "../utils/feedSlice";
import Avatar from "./Avatar";
import ChatList from "./ChatList";

const Navbar = () => {
	const user = useSelector((store) => store.user);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const handleLogout = async () => {
		try {
			await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
			dispatch(removeUser());
			dispatch(removeFeed());
			navigate("/login");
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className="fixed top-0 left-0 w-full bg-base-100/20 backdrop-blur-xl border-b border-white/10 z-50 shadow-2xl">
			<div className="navbar w-full px-6">
				{/* Logo */}
				<div className="navbar-start">
					<Link
						to="/"
						className="flex items-center gap-2 text-2xl font-bold text-primary"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-7 w-7 text-primary"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M12 2c-3.5 5.5-7 8-7 12 0 3.866 3.134 7 7 7s7-3.134 7-7c0-4-3.5-6.5-7-12zm0 17c-2.209 0-4-1.791-4-4 0-1.389.707-2.651 1.793-3.454.648.857 1.813 1.454 3.207 1.454 1.564 0 2.743-1.245 2.993-2.654.642 1.029 1.007 2.264 1.007 3.654 0 2.209-1.791 4-4 4z" />
						</svg>
						DevTinder
					</Link>
				</div>

				{/* Primary nav - Centered - Only show authenticated features after login */}
				<div className="navbar-center">
					{user && (
						<div className="hidden md:flex items-center gap-2">
							<Link to="/feed" className="btn btn-ghost btn-sm">
								Feed
							</Link>
							<Link to="/connections" className="btn btn-ghost btn-sm">
								Connections
							</Link>
							<Link to="/requests" className="btn btn-ghost btn-sm">
								Requests
							</Link>
							<Link to="/sent" className="btn btn-ghost btn-sm">
								Sent
							</Link>
						</div>
					)}
				</div>

				{/* User section */}
				<div className="navbar-end">
					{user ? (
						<div className="flex items-center gap-3">
							{/* Chat List */}
							<ChatList />

							{/* Welcome message */}
							<div className="badge badge-outline p-3 hidden sm:flex">
								Welcome, {user.firstName}
							</div>

							{/* Profile Picture Menu */}
							<div className="dropdown dropdown-end">
								<label
									tabIndex={0}
									className="btn btn-ghost p-1 hover:bg-base-200 transition-colors duration-200"
								>
									<Avatar
										firstName={user.firstName}
										lastName={user.lastName}
										photoUrl={user.photoUrl}
										size="w-10 h-10"
										textSize="text-sm"
										className="ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200"
									/>
								</label>
								<ul
									tabIndex={0}
									className="menu menu-sm dropdown-content mt-3 z-[60] p-2 shadow-xl bg-base-200/90 backdrop-blur rounded-box w-56"
								>
									<li>
										<Link to="/profile">Profile</Link>
									</li>
									<li>
										<Link to="/feed">Feed</Link>
									</li>
									<li>
										<Link to="/connections">Connections</Link>
									</li>
									<li>
										<Link to="/requests">Requests</Link>
									</li>
									<li>
										<Link to="/sent">Sent</Link>
									</li>
									<li>
										<button className="text-error" onClick={handleLogout}>
											Logout
										</button>
									</li>
								</ul>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Link
								to="/login"
								className="btn btn-sm px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-700 via-indigo-800 to-violet-800 hover:from-blue-800 hover:via-indigo-900 hover:to-violet-900 border-0 text-white"
							>
								Login
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Navbar;
