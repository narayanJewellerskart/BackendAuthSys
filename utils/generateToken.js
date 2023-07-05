import jwt from "jsonwebtoken";

export const generateToken = (id, expiryTime) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: expiryTime || "1d",
	});
};

export const sentTokenToCookie = (res, token) => {
	res.cookie("jwt", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
		sameSite: "strict",
		maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
	});
};
