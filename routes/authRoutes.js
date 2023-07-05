import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { forgotPasswordLinkSent, loginUser, logoutUser, registerUser, resendOtp, resetPasswordThroughLink, verifyUser } from "../controllers/authController.js";

router.route("/").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/resend_otp").post(protect, resendOtp);
router.route("/forgot_password_link_sent").post(forgotPasswordLinkSent);
router.route("/reset_password").post(resetPasswordThroughLink);
router.route("/verify_user").post(protect, verifyUser);

export default router;
