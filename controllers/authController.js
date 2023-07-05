import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import passwordHashing from "../utils/password.js";
import { generateToken, sentTokenToCookie } from "../utils/generateToken.js";

export const registerUser = expressAsyncHandler(async (req, res) => {
	const { name, email, password } = req.body;
	//generate otp
	let otp = Math.floor(100000 + Math.random() * 900000);

	//check the fields are empty or not

	if (!name || !email || !password) {
		res.status(400);
		throw new Error("Please fill all the fields");
	}

	//check the email is already registered
	const userExists = await User.findOne({
		email,
	});

	if (userExists) {
		res.status(400);
		throw new Error("Email is already used. Either login or choose different email.");
	}

	let hashPassword = await passwordHashing(password);

	const user = await User.create({
		email,
		name,
		password: hashPassword,
		otp,
	});

	const token = user && generateToken(user._id);

	if (user) {
		sentTokenToCookie(res, token);
		// otpSentToMail(user.name, user.email, otp); // frist create your own mail system
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			verified: user.isVerified,
		});
	} else {
		res.status(400);
		throw new Error("Failed to create a user");
	}
});

export const verifyUser = expressAsyncHandler(async (req, res) => {
	let minutes = process.env.OTP_TIME || 10;
	let now = new Date().getTime();
	let otpTime;
	let otpFromDatabase;

	const { otp } = req.body;

	const user = await User.findById(req.user._id);

	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	otpTime = new Date(user.otpTime).getTime();
	otpFromDatabase = user.otp;

	if (now - otpTime > minutes * 60 * 1000) {
		const update = {
			$set: {
				isOtpExpired: true,
			},
		};

		const options = {
			new: true, // return the updated document
		};
		await user.updateOne(update, options);

		res.json({
			message: "OTP expired",
		});
	} else {
		if (otpFromDatabase !== Number.parseInt(otp)) {
			res.status(400);
			throw new Error("Please enter a valid OTP");
		} else {
			// only update the isVerified field
			const update = {
				$set: {
					isVerified: true,
				},
			};

			const options = {
				new: true, // return the updated document
			};

			const verifiedUser = await user.updateOne(update, options);

			res.json({
				message: "User Verified",
			});
		}
	}
});

export const loginUser = expressAsyncHandler(async (req, res) => {
	const { email, password } = req.body;

	let verifiedUser;
	let token;

	const user = await User.findOne({ email });

	if (user) {
		verifiedUser = user.isVerified;
		token = generateToken(user._id);
	}

	if (user && (await user.matchPassword(password))) {
		if (verifiedUser) {
			sentTokenToCookie(res, token);
			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				verified: user.isVerified,
			});
		} else {
			res.status(400);
			throw new Error("Please verify the email!");
		}
	} else {
		res.status(401);
		throw new Error("Invalid email or password");
	}
});

export const resendOtp = expressAsyncHandler(async (req, res) => {
	//generate otp
	let generatedOtp = Math.floor(100000 + Math.random() * 900000);

	//Find User
	const user = await User.findById(req.user._id);

	//Check User

	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	if (!user.isVerified) {
		// otpSentToMail(user.name, user.email, generatedOtp);

		// Update the otp field of user

		const update = {
			$set: {
				otp: generatedOtp,
			},
		};

		const options = {
			new: true, // return the updated document
		};

		const otpFieldUpdatedUser = await user.updateOne(update, options);

		if (otpFieldUpdatedUser) {
			res.json({
				message: "OTP Send Successfully",
			});
		} else {
			res.status(400);
			throw new Error("There is a problem. Please try after sometime");
		}
	} else {
		res.json({
			message: "You are already verified",
		});
	}
});

export const forgotPasswordLinkSent = expressAsyncHandler(async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });

	if (!user) {
		res.status(400);
		throw new Error("User not found");
	}

	let token = generateToken(user._id, process.env.RESET_PASSWORD_TIME);
	console.log("token:", token);
	let link = `${process.env.BASE_URL}/reset_password/${token}`;

	// Mail Sent

	// forgotPasswordMail(user.name, user.email, link);

	// Update the link expiry field of user

	const update = {
		$set: {
			isForgotPasswordLinkUsed: false,
		},
	};

	const options = {
		new: true, // return the updated document
	};

	const updateUser = await user.updateOne(update, options);

	if (updateUser) {
		res.json({
			message: "Reset Password mail sent successfully",
		});
	} else {
		res.status(400);
		throw new Error("There is a problem. Please try after sometime.");
	}
});

export const resetPasswordThroughLink = expressAsyncHandler(async (req, res) => {
	const { token, password } = req.body;

	// Decrypt Token
	const decode = jwt.verify(token, process.env.JWT_SECRET);

	//Check Token Expired Or Not
	if (!decode) {
		res.status(400);
		throw new Error("Link has been expired. Please generate again!");
	}

	// Find User based on token
	const user = await User.findById(decode.id);

	if (!user) {
		res.status(400);
		throw new Error("User not found");
	}

	if (!user.isForgotPasswordLinkUsed) {
		const hashingPassword = await passwordHashing(password);

		const updatePassword = {
			$set: {
				password: hashingPassword,
				isForgotPasswordLinkUsed: true,
			},
		};

		const options = {
			new: true, // return the updated document
		};

		const updatedUserPassword = await user.updateOne(updatePassword, options);

		if (!updatedUserPassword) {
			res.status(400);
			throw new Error("There is a problem. Please try after sometime.");
		} else {
			res.json({
				message: "Password changed successfully",
			});
		}
	} else {
		res.status(401);
		throw new Error("Link has been already used. Please generate again");
	}

	//Check the link is valid or not this is manual
	// let minutes =
	// 	process.env.RESET_PASSWORD_TIME || 10;
	// let now = new Date().getTime();
	// let resetPasswordTime = new Date(
	// 	user.isForgotPasswordLinkTime
	// ).getTime();

	// if (
	// 	now - resetPasswordTime >
	// 	minutes * 60 * 1000
	// ) {
	// 	res.status(400);
	// 	throw new Error("Link has been expired");
	// }
});

export const logoutUser = (req, res) => {
	res.cookie("jwt", "", {
		httpOnly: true,
		expires: new Date(0),
	});
	res.status(200).json({ message: "Logged out successfully" });
};
