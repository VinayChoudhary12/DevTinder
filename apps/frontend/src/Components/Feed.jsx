import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";

const Feed = () => {
	const dispatch = useDispatch();
	const feed = useSelector((store) => store.feed);
	console.log("Feed data:", feed);

	const getFeed = async () => {
		// Always fetch fresh data for debugging
		try {
			const response = await axios.get(BASE_URL + "/feed?limit=30", {
				withCredentials: true,
			});
			console.log("Feed API response:", response.data);
			dispatch(addFeed(response.data?.data || []));
		} catch (err) {
			console.log("Feed error:", err);
		}
	};

	useEffect(() => {
		getFeed();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Loading state
	if (feed === null || feed === undefined) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<div className="loading loading-spinner loading-lg"></div>
			</div>
		);
	}

	// Empty state
	if (feed.length <= 0) {
		return (
			<div className="hero min-h-[60vh] bg-base-200 rounded-2xl">
				<div className="hero-content text-center">
					<div className="max-w-md">
						<h1 className="text-4xl font-bold">You reached the end!</h1>
						<p className="py-6 opacity-80">
							No more profiles right now. Check back later or update your
							interests.
						</p>
						<button className="btn btn-primary" onClick={getFeed}>
							Refresh Feed
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 my-8 justify-items-center">
			{feed.map((user) => (
				<UserCard key={user._id} user={user} showActions={true} />
			))}
		</div>
	);
};

export default Feed;
