import React, { useState } from "react";
import UserCard from "./UserCard";
import Avatar from "./Avatar";
import ImageCropper from "./ImageCropper";
import SkillsInput from "./SkillsInput";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
	const [firstName, setFirstname] = useState(user.firstName);
	const [lastName, setLastName] = useState(user.lastName);
	const [photoURL, setPhotoURL] = useState(user.photoUrl);
	const [age, setAge] = useState(user.age || "");
	const [gender, setGender] = useState(user.gender);
	const [about, setAbout] = useState(user.about);
	const [skills, setSkills] = useState(user.skills || []);
	const [error, setError] = useState("");
	const [showToast, setShowToast] = useState(false);
	const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const dispatch = useDispatch();
	const [showCropper, setShowCropper] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);

	const handleFileChange = (e) => {
		const file = e.target.files && e.target.files[0];
		if (!file) return;
		const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		if (!allowed.includes(file.type)) {
			setError("Only JPG, PNG, WEBP, GIF allowed");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			setSelectedImage(reader.result);
			setShowCropper(true);
		};
		reader.readAsDataURL(file);
	};

	const uploadCropped = async (croppedImageBlob) => {
		setIsUploadingPhoto(true);
		try {
			const form = new FormData();
			form.append("photo", croppedImageBlob, "profile.jpg");
			const res = await axios.post(`${BASE_URL}/upload/profile-photo`, form, {
				withCredentials: true,
				headers: { "Content-Type": "multipart/form-data" },
			});
			dispatch(addUser(res.data.data));
			setPhotoURL(res.data.data.photoUrl);
			setShowCropper(false);
			setSelectedImage(null);
			setShowToast(true);
			setTimeout(() => setShowToast(false), 3000);
		} catch (err) {
			setError(err?.response?.data?.message || "Upload failed");
		} finally {
			setIsUploadingPhoto(false);
		}
	};

	const saveProfile = async () => {
		setError("");
		setIsSaving(true);
		try {
			const res = await axios.patch(
				BASE_URL + "/profile/edit",
				{
					firstName,
					lastName,
					photoUrl: photoURL,
					age,
					gender,
					about,
					skills,
				},
				{
					withCredentials: true,
				}
			);
			dispatch(addUser(res.data.data));
			setShowToast(true);
			setTimeout(() => setShowToast(false), 3000);
		} catch (error) {
			setError(error.response.data);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-7xl mx-auto">
						{/* Headers Section - Same Line */}
						<div className="flex flex-col lg:flex-row gap-8 mb-8">
							<div className="lg:w-1/3 flex justify-center">
								<h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
									Live Preview
								</h2>
							</div>
							<div className="lg:w-2/3 flex justify-center">
								<h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
									Edit Profile
								</h2>
							</div>
						</div>

						{/* Content Section */}
						<div className="flex flex-col lg:flex-row gap-8">
							{/* Live Preview - LEFT SIDE */}
							<div className="lg:w-1/3 flex justify-center">
								<div 
									className="w-full max-w-sm lg:sticky lg:top-20 lg:self-start"
									style={{ 
										maxHeight: 'calc(100vh - 5rem)',
										overflow: 'visible',
										zIndex: 10
									}}
								>
									<div className="profile-preview shadow-2xl">
										<UserCard
											user={{
												_id: "preview",
												firstName,
												lastName,
												photoUrl: photoURL,
												about,
												age,
												gender,
												skills,
											}}
											showActions={false}
										/>
									</div>
								</div>
							</div>

							{/* Edit Form - RIGHT SIDE */}
							<div className="lg:w-2/3">
								<div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-2xl border border-base-300">
									<div className="card-body">
										{/* Profile Picture Section */}
										<div className="text-center mb-8">
											<div className="relative inline-block">
												<Avatar
													firstName={firstName}
													lastName={lastName}
													photoUrl={photoURL}
													size="w-32 h-32"
													textSize="text-4xl"
													className="border-4 border-primary shadow-lg hover:shadow-xl transition-all duration-300"
												/>
												<label className="absolute bottom-0 right-0 btn btn-circle btn-primary btn-sm shadow-lg cursor-pointer hover:scale-110 transition-transform">
													{isUploadingPhoto ? (
														<div className="loading loading-spinner loading-xs"></div>
													) : (
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
																d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
															/>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2"
																d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
															/>
														</svg>
													)}
													<input
														type="file"
														accept="image/*"
														onChange={handleFileChange}
														className="hidden"
														disabled={isUploadingPhoto}
													/>
												</label>
											</div>
											<p className="text-sm text-base-content/70 mt-2">
												Click the camera icon to upload a new photo
											</p>
										</div>

										{/* Form Grid */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{/* First Name */}
											<label className="form-control">
												<div className="label">
													<span className="label-text font-medium">
														First Name
													</span>
												</div>
												<input
													type="text"
													value={firstName}
													onChange={(e) => setFirstname(e.target.value)}
													className="input input-bordered input-primary focus:input-primary w-full"
													placeholder="Enter your first name"
												/>
											</label>

											{/* Last Name */}
											<label className="form-control">
												<div className="label">
													<span className="label-text font-medium">
														Last Name
													</span>
												</div>
												<input
													type="text"
													value={lastName}
													onChange={(e) => setLastName(e.target.value)}
													className="input input-bordered input-primary focus:input-primary w-full"
													placeholder="Enter your last name"
												/>
											</label>

											{/* Age */}
											<label className="form-control">
												<div className="label">
													<span className="label-text font-medium">Age</span>
												</div>
												<input
													type="number"
													value={age}
													onChange={(e) => setAge(e.target.value)}
													className="input input-bordered input-primary focus:input-primary w-full"
													placeholder="Enter your age"
													min="18"
													max="100"
												/>
											</label>

											{/* Gender */}
											<label className="form-control">
												<div className="label">
													<span className="label-text font-medium">Gender</span>
												</div>
												<select
													value={gender}
													onChange={(e) => setGender(e.target.value)}
													className="select select-bordered select-primary focus:select-primary w-full"
												>
													<option value="">Select gender</option>
													<option value="male">Male</option>
													<option value="female">Female</option>
													<option value="other">Other</option>
												</select>
											</label>
										</div>

										{/* Skills */}
										<div className="mt-6">
											<SkillsInput skills={skills} onSkillsChange={setSkills} />
										</div>

										{/* About */}
										<label className="form-control mt-6">
											<div className="label">
												<span className="label-text font-medium">About</span>
												<span className="label-text-alt">
													{about.length}/500 characters
												</span>
											</div>
											<textarea
												value={about}
												onChange={(e) => setAbout(e.target.value)}
												className="textarea textarea-bordered textarea-primary focus:textarea-primary w-full h-32 resize-none"
												placeholder="Tell us about yourself..."
												maxLength="500"
											/>
										</label>

										{/* Error Message */}
										{error && (
											<div className="alert alert-error mt-6">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="stroke-current shrink-0 h-6 w-6"
													fill="none"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
													/>
												</svg>
												<span>{error}</span>
											</div>
										)}

										{/* Save Button */}
										<div className="card-actions justify-center mt-8">
											<button
												className="btn btn-primary btn-lg px-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
												onClick={saveProfile}
												disabled={isSaving}
											>
												{isSaving && (
													<span className="loading loading-spinner loading-sm"></span>
												)}
												{isSaving ? "Saving..." : "Save Profile"}
												{!isSaving && (
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-5 w-5 ml-2"
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
												)}
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Image Cropper Modal */}
			{showCropper && (
				<ImageCropper
					imageSrc={selectedImage}
					onCropComplete={(croppedAreaPixels) => {}}
					onCancel={() => setShowCropper(false)}
					onSave={uploadCropped}
				/>
			)}

			{/* Success Toast */}
			{showToast && (
				<div className="toast toast-top toast-center z-50">
					<div className="alert alert-success shadow-lg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="stroke-current shrink-0 h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>Profile saved successfully!</span>
					</div>
				</div>
			)}
		</>
	);
};

export default EditProfile;
