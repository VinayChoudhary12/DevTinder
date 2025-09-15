import React, { useState } from "react";

const SkillsInput = ({ skills, onSkillsChange }) => {
	const [inputValue, setInputValue] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

	const suggestedSkills = [
		"React",
		"Node.js",
		"JavaScript",
		"TypeScript",
		"Python",
		"Java",
		"C++",
		"Angular",
		"Vue.js",
		"Next.js",
		"Express.js",
		"MongoDB",
		"PostgreSQL",
		"AWS",
		"Docker",
		"Kubernetes",
		"Git",
		"Redux",
		"GraphQL",
		"REST API",
		"HTML",
		"CSS",
		"Tailwind CSS",
		"Bootstrap",
		"Figma",
		"UI/UX Design",
		"Machine Learning",
		"Data Science",
		"DevOps",
		"CI/CD",
		"Jest",
		"Testing",
	];

	const filteredSuggestions = suggestedSkills
		.filter(
			(skill) =>
				skill.toLowerCase().includes(inputValue.toLowerCase()) &&
				!skills.includes(skill) &&
				inputValue.length > 0
		)
		.slice(0, 6);

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (showSuggestions && selectedSuggestionIndex >= 0) {
				// Add selected suggestion
				addSuggestedSkill(filteredSuggestions[selectedSuggestionIndex]);
			} else if (inputValue.includes(",")) {
				// Handle multiple skills separated by commas
				const newSkills = inputValue
					.split(",")
					.map((skill) => skill.trim())
					.filter((skill) => skill && !skills.includes(skill));

				if (newSkills.length > 0) {
					onSkillsChange([...skills, ...newSkills]);
				}
				setInputValue("");
			} else {
				// Handle single skill
				addSkill(inputValue);
			}
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			if (showSuggestions && filteredSuggestions.length > 0) {
				setSelectedSuggestionIndex((prev) =>
					prev < filteredSuggestions.length - 1 ? prev + 1 : 0
				);
			}
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			if (showSuggestions && filteredSuggestions.length > 0) {
				setSelectedSuggestionIndex((prev) =>
					prev > 0 ? prev - 1 : filteredSuggestions.length - 1
				);
			}
		} else if (e.key === "," && inputValue.trim()) {
			e.preventDefault();
			addSkill(inputValue);
		} else if (
			e.key === "Backspace" &&
			inputValue === "" &&
			skills.length > 0
		) {
			removeLastSkill();
		} else if (e.key === "Escape") {
			setShowSuggestions(false);
			setSelectedSuggestionIndex(-1);
		}
	};

	const addSkill = (skillText) => {
		const newSkill = skillText.trim();
		if (newSkill && !skills.includes(newSkill)) {
			onSkillsChange([...skills, newSkill]);
			setInputValue("");
			setShowSuggestions(false);
		} else if (newSkill && skills.includes(newSkill)) {
			setInputValue("");
		}
	};

	const removeSkill = (skillToRemove) => {
		onSkillsChange(skills.filter((skill) => skill !== skillToRemove));
	};

	const removeLastSkill = () => {
		if (skills.length > 0) {
			const newSkills = [...skills];
			newSkills.pop();
			onSkillsChange(newSkills);
		}
	};

	const addSuggestedSkill = (skill) => {
		addSkill(skill);
		setShowSuggestions(false);
		setSelectedSuggestionIndex(-1);
	};

	return (
		<label className="form-control relative">
			<div className="label">
				<span className="label-text font-medium">Skills</span>
				<span className="label-text-alt">
					{skills.length} skill{skills.length !== 1 ? "s" : ""} added
				</span>
			</div>

			<div className="relative">
				<input
					type="text"
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.target.value);
						setShowSuggestions(e.target.value.length > 0);
						setSelectedSuggestionIndex(-1);
					}}
					onKeyDown={handleKeyDown}
					onFocus={() => {
						setShowSuggestions(inputValue.length > 0);
						setSelectedSuggestionIndex(-1);
					}}
					onBlur={() =>
						setTimeout(() => {
							setShowSuggestions(false);
							setSelectedSuggestionIndex(-1);
						}, 150)
					}
					className="input input-bordered input-primary focus:input-primary w-full pr-20"
					placeholder="Type a skill and press Enter or use comma to separate multiple skills"
				/>

				{/* Shortcut hint */}
				<div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-base-content/50 pointer-events-none">
					Enter / ,
				</div>

				{/* Suggestions dropdown */}
				{showSuggestions && filteredSuggestions.length > 0 && (
					<div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-primary/20 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto skills-suggestions">
						{filteredSuggestions.map((skill, index) => (
							<button
								key={index}
								type="button"
								className={`w-full text-left px-4 py-2 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
									index === selectedSuggestionIndex
										? "bg-primary text-primary-content"
										: "hover:bg-base-200"
								}`}
								onClick={() => addSuggestedSkill(skill)}
							>
								<span className="text-sm">{skill}</span>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Help text */}
			<div className="label">
				<span className="label-text-alt text-xs opacity-70">
					💡 Press <kbd className="kbd kbd-xs">Enter</kbd> to add, use commas
					for multiple, <kbd className="kbd kbd-xs">↑↓</kbd> to navigate
					suggestions, or <kbd className="kbd kbd-xs">Backspace</kbd> to remove
					the last one
				</span>
			</div>

			{/* Blue separator */}
			<div className="flex items-center mt-4 mb-3">
				<div className="flex-grow h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
				<div className="px-3 text-xs font-medium text-primary/60 bg-base-100">
					Skills Added
				</div>
				<div className="flex-grow h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
			</div>

			{/* Skills display */}
			<div className="flex flex-wrap gap-2">
				{skills.map((skill, index) => (
					<div
						key={index}
						className="badge badge-primary badge-lg gap-2 cursor-pointer hover:badge-secondary transition-all duration-200 group"
						onClick={() => removeSkill(skill)}
					>
						<span>{skill}</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-3 w-3 group-hover:rotate-90 transition-transform duration-200"
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
					</div>
				))}

				{skills.length === 0 && (
					<div className="text-sm text-base-content/50 italic py-2">
						No skills added yet. Start typing to add your first skill!
					</div>
				)}
			</div>
		</label>
	);
};

export default SkillsInput;
