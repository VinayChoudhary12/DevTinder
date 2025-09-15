import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";

const Body = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((store) => store.user);
	const location = useLocation();

	const fetchUser = async () => {
		try {
			const user = await axios.get(BASE_URL + "/profile/view", {
				withCredentials: true,
			});
			// console.log(user.data);
			dispatch(addUser(user.data));
		} catch (err) {
			if (err?.response?.status === 401) {
				// Only redirect to login from protected pages
				if (location.pathname !== "/" && location.pathname !== "/login") {
					navigate("/login");
				}
			}
			console.log(err);
		}
	};

	useEffect(() => {
		if (!user) fetchUser();
	}, [location.pathname, user]);
	return (
		<div>
			<Navbar />
			<div className="pt-20 max-w-screen-2xl mx-auto px-6">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
};

export default Body;
