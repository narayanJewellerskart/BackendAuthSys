import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = expressAsyncHandler(async (req, res, next) => {
	let token;

	token = req.cookies.jwt;

	//req?.headers?.authorization?.startsWith("Bearer")

	if (token) {
		try {
			// token = req.headers.authorization.split(" ")[1];
			const decode = jwt.verify(token, process.env.JWT_SECRET);

			req.user = await User.findById(decode.id).select("-password");

			next();
		} catch (error) {
			res.status(401);
			throw new Error("Not authorized token failed");
		}
	}
	if (!token) {
		res.status(401);
		throw new Error("You are not logged in!");
	}
});

const admin = (req, res, next) => {
	if (req.user && req.user.isAdmin) {
		next();
	} else {
		res.status(401);
		throw new Error("Not authorized as an admin");
	}
};

// These code is for separate admin model

// //-----------------------😈😈😈😈😈 Admin 😈😈😈😈😈-----------------------

// const adminProtected = expressAsyncHandler(async (req, res, next) => {
// 	let token;

// 	token = req.cookies.jwt;
// 	if (token) {
// 		try {
// 			const decode = jwt.verify(token, process.env.JWT_SECRET);

// 			req.user = await Admin.findById(decode.id).select("-password");

// 			if (req.user && req.user.isAdmin) {
// 				next();
// 			} else {
// 				res.status(401);
// 				throw new Error("Not authorized as an admin");
// 			}
// 		} catch (error) {
// 			res.status(401);
// 			throw new Error("Not authorized token failed");
// 		}
// 	}

// 	if (!token) {
// 		res.status(401);
// 		throw new Error("You are not logged in!");
// 	}
// });

// //😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈 Super Admin 😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈

// const superAdminProtected = expressAsyncHandler(async (req, res, next) => {
// 	let token;

// 	token = req.cookies.jwt;
// 	if (token) {
// 		try {
// 			const decode = jwt.verify(token, process.env.JWT_SECRET);

// 			req.user = await Admin.findById(decode.id).select("-password");

// 			if (req.user && req.user.isSuperAdmin) {
// 				next();
// 			} else {
// 				res.status(401);
// 				throw new Error("Not authorized as an admin");
// 			}
// 		} catch (error) {
// 			res.status(401);
// 			throw new Error("Not authorized token failed");
// 		}
// 	}

// 	if (!token) {
// 		res.status(401);
// 		throw new Error("You are not logged in!");
// 	}
// });

export { protect, admin };
