import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

// Utility function to create image
const createImage = (url) =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (error) => reject(error));
		image.setAttribute("crossOrigin", "anonymous");
		image.src = url;
	});

// Utility function to get cropped image blob
function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
	return new Promise(async (resolve) => {
		const image = await createImage(imageSrc);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		canvas.width = pixelCrop.width;
		canvas.height = pixelCrop.height;

		ctx.drawImage(
			image,
			pixelCrop.x,
			pixelCrop.y,
			pixelCrop.width,
			pixelCrop.height,
			0,
			0,
			pixelCrop.width,
			pixelCrop.height
		);

		canvas.toBlob(
			(blob) => {
				resolve(blob);
			},
			"image/jpeg",
			0.92
		);
	});
}

const ImageCropper = ({ imageSrc, onCropComplete, onCancel, onSave }) => {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const [isSaving, setIsSaving] = useState(false);

	const onCropCompleteCallback = useCallback(
		(croppedArea, croppedAreaPixels) => {
			setCroppedAreaPixels(croppedAreaPixels);
			onCropComplete(croppedAreaPixels);
		},
		[onCropComplete]
	);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const croppedImage = await getCroppedImg(
				imageSrc,
				croppedAreaPixels,
				rotation
			);
			await onSave(croppedImage);
		} catch (e) {
			console.error(e);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
				{/* Header */}
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900">
						Crop Your Photo
					</h3>
					<p className="text-sm text-gray-600">
						Position your photo to fit perfectly. The circular area will be your
						profile picture, displayed in a rectangular card.
					</p>
					<div className="mt-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
						💡 <strong>Tip:</strong> Center your face in the circle - this area
						will be your main profile image that appears in cards.
					</div>
				</div>

				{/* Cropper */}
				<div className="relative h-96 bg-gray-100">
					<Cropper
						image={imageSrc}
						crop={crop}
						zoom={zoom}
						rotation={rotation}
						aspect={1}
						onCropChange={setCrop}
						onZoomChange={setZoom}
						onRotationChange={setRotation}
						onCropComplete={onCropCompleteCallback}
						cropShape="circle"
						showGrid={false}
						cropSize={{ width: 280, height: 280 }}
					/>
				</div>

				{/* Controls */}
				<div className="px-6 py-4 space-y-4 border-b border-gray-200">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Left side - Controls */}
						<div className="space-y-4">
							{/* Zoom Control */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Zoom: {Math.round(zoom * 100)}%
								</label>
								<input
									type="range"
									min={1}
									max={3}
									step={0.1}
									value={zoom}
									onChange={(e) => setZoom(e.target.value)}
									className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
								/>
							</div>

							{/* Rotation Control */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Rotation: {rotation}°
								</label>
								<input
									type="range"
									min={-180}
									max={180}
									step={1}
									value={rotation}
									onChange={(e) => setRotation(e.target.value)}
									className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
								/>
							</div>
						</div>

						{/* Right side - Card Preview */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								How it appears in your profile card
							</label>
							<div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-dashed border-blue-200">
								<div className="bg-white rounded-lg shadow-md p-4 max-w-[200px] mx-auto">
									<div className="text-center space-y-2">
										<div className="w-16 h-16 bg-gray-200 rounded-full mx-auto border-2 border-blue-300 flex items-center justify-center">
											<span className="text-xs text-gray-500">Your Photo</span>
										</div>
										<div className="space-y-1">
											<div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
											<div className="h-2 bg-gray-100 rounded w-16 mx-auto"></div>
										</div>
									</div>
								</div>
								<p className="text-xs text-center text-gray-600 mt-2">
									The circular crop will fit perfectly in rectangular profile
									cards
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="px-6 py-4 flex justify-end space-x-3 bg-gray-50">
					<button
						onClick={onCancel}
						disabled={isSaving}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						disabled={isSaving}
						className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{isSaving && (
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						)}
						{isSaving ? "Saving..." : "Save Photo"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ImageCropper;
