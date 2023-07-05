import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			unique: true,
			trim: true,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		isForgotPasswordLinkUsed: {
			type: Boolean,
			default: true,
		},
		otp: {
			type: Number,
			required: true,
		},
		isOtpExpired: {
			type: Boolean,
			default: false,
			required: true,
		},
		otpTime: {
			type: Date,
			required: true,
			default: Date.now,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isAdmin: {
			type: Boolean,
			default: false,
			required: true,
		},
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "modified_at",
		},
	}
);

userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// userSchema.pre("save", async function (next) {
// 	if (!this.isModified) {
// 		next();
// 	}

// 	const salt = await bcrypt.genSalt(10);
// 	this.password = await bcrypt.hash(this.password, salt);
// });

const User = mongoose.model("User", userSchema);

export default User;
