import axios from "axios";
import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import Avatar from "./Avatar";

const Requests = () => {
	const dispatch = useDispatch();
	const requests = useSelector((store) => store.request);
	console.log(requests);

	const reviewRequest = async (status, _id) => {
		try {
			const res = await axios.post(
				BASE_URL + "/request/review" + "/" + status + "/" + _id,
				{},
				{ withCredentials: true }
			);
			dispatch(removeRequest(_id));
		} catch (error) {
			console.log(error);
		}
	};

	const fetchRequests = async () => {
		try {
			const requests = await axios.get(BASE_URL + "/user/requests/received", {
				withCredentials: true,
			});
			dispatch(addRequests(requests.data.data));
			//   console.log(requests.data.connectionRequests);
		} catch (error) {
			console.log(error);
		}
	};

	useState(() => {
		fetchRequests();
	}, []);
	if (!requests) return;
	if (requests.length == 0)
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						Requests (0)
					</h1>
					<div className="hero min-h-[50vh] bg-gradient-to-br from-base-100 to-base-200 rounded-2xl shadow-xl border border-base-300">
						<div className="hero-content text-center">
							<div className="max-w-md">
								<div className="mb-6">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-24 w-24 mx-auto text-primary/50"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="1.5"
											d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
										/>
									</svg>
								</div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
									No Requests Found
								</h1>
								<p className="text-base-content/70 leading-relaxed">
									You don't have any connection requests right now. Check back
									later or explore the feed to make new connections!
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					Requests ({requests.length})
				</h1>
				<div className="space-y-4">
					{requests.map((request) => {
						const { _id, firstName, lastName, photoUrl, age, gender, about } =
							request.fromUserId;

						return (
							<div
								key={_id}
								className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300"
							>
								<div className="card-body">
									<div className="flex flex-col md:flex-row items-center gap-6">
										{/* Avatar Section */}
										<div className="flex-shrink-0">
											<Avatar
												firstName={firstName}
												lastName={lastName}
												photoUrl={photoUrl}
												size="w-20 h-20"
												textSize="text-2xl"
												className="border-4 border-primary/20 shadow-lg"
											/>
										</div>

										{/* User Info Section */}
										<div className="flex-grow text-center md:text-left">
											<h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
												{firstName} {lastName}
											</h2>
											{age && gender && (
												<div className="badge badge-outline badge-lg mb-3">
													{age}, {gender}
												</div>
											)}
											{about && (
												<p className="text-base-content/80 leading-relaxed line-clamp-2">
													{about}
												</p>
											)}
										</div>

										{/* Action Buttons */}
										<div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
											<button
												className="btn btn-success hover:btn-success hover:scale-105 transition-all duration-200 gap-2 min-w-24"
												onClick={() => reviewRequest("accepted", request._id)}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="M5 13l4 4L19 7"
													/>
												</svg>
												Accept
											</button>
											<button
												className="btn btn-error hover:btn-error hover:scale-105 transition-all duration-200 gap-2 min-w-24"
												onClick={() => reviewRequest("rejected", request._id)}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
												Reject
											</button>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default Requests;
