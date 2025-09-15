import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUserToFeed } from "../utils/feedSlice";
import Avatar from "./Avatar";

const statusBadge = (status) => {
	const map = {
		created: "badge-info",
		interested: "badge-info",
		accepted: "badge-success",
		rejected: "badge-error",
		ignored: "badge-ghost",
	};
	return map[status] || "";
};

const capitalizeStatus = (status) => {
	return status.charAt(0).toUpperCase() + status.slice(1);
};

const Sent = () => {
	const [sent, setSent] = useState(null);
	const dispatch = useDispatch();

	const fetchSent = async () => {
		try {
			const res = await axios.get(BASE_URL + "/user/requests/sent", {
				withCredentials: true,
			});
			setSent(res.data.data || []);
		} catch (e) {
			console.log(e);
		}
	};

	const handleCancelRequest = async (requestId) => {
		try {
			// Find the request to get user data before deleting
			const requestToCancel = sent.find(request => request._id === requestId);
			
			console.log("Attempting to cancel request:", requestId);
			const response = await axios.delete(BASE_URL + "/request/cancel/" + requestId, {
				withCredentials: true,
			});
			console.log("Cancel request successful:", response.data);
			
			// Remove the cancelled request from the local state
			setSent(sent.filter(request => request._id !== requestId));
			
			// Add the user back to the feed if request data exists
			if (requestToCancel && requestToCancel.toUserId) {
				dispatch(addUserToFeed(requestToCancel.toUserId));
			}
		} catch (error) {
			console.log("Error cancelling request:", error);
			console.log("Error response:", error.response?.data);
			console.log("Error status:", error.response?.status);
			const errorMessage = error.response?.data?.message || error.message || "Unknown error";
			alert(`Failed to cancel request: ${errorMessage}`);
		}
	};

	useEffect(() => {
		fetchSent();
	}, []);

	if (!sent) return null;

	if (sent.length === 0)
		return (
			<div className="hero min-h-[60vh] bg-base-200 rounded-2xl">
				<div className="hero-content text-center">
					<div className="max-w-md">
						<h1 className="text-3xl font-bold">No sent requests</h1>
						<p className="opacity-80">Go to Feed and start connecting!</p>
					</div>
				</div>
			</div>
		);

	return (
		<div className="my-10 space-y-4">
			<h2 className="text-2xl font-semibold">Sent Requests ({sent.length})</h2>
			<div className="space-y-3">
				{sent.map((row) => {
					const u = row.toUserId || {};
					const canCancel = ["interested", "ignored"].includes(row.status);
					return (
						<div
							key={row._id}
							className="flex items-center gap-4 bg-base-300 rounded-xl p-4"
						>
							<Avatar
								firstName={u.firstName}
								lastName={u.lastName}
								photoUrl={u.photoUrl}
								size="w-12 h-12"
								textSize="text-sm"
							/>
							<div className="flex-1 text-left">
								<div className="font-medium">
									{u.firstName + " " + (u.lastName || "")}
								</div>
								<div className="text-sm opacity-80">
									{u.age ? `${u.age}, ` : ""}
									{u.gender || ""}
								</div>
							</div>
							<div className={`badge ${statusBadge(row.status)}`}>
								{capitalizeStatus(row.status)}
							</div>
							{canCancel && (
								<button
									className="btn btn-sm btn-error btn-outline hover:btn-error"
									onClick={() => handleCancelRequest(row._id)}
									title="Cancel request"
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
								</button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Sent;
