import express from "express";
import {
  sendOtp,
  verifyOtp,
  register,
  login,employeeLogin,refreshToken
} from "./auth.controller.js";
import {adminLogin,registerEmployee,verifyForgotPasswordOtp,resetPassword,forgotPassword }from "./admin/admin.controller.js"
import {protect} from "../../middleware/authMiddleware.js"
const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", register);
router.post('/login',login)

router.post('/admin-login',adminLogin)
router.post("/employee/login", employeeLogin);


router.post('/emp-register',protect,registerEmployee)

// this is for admin and employee
router.post('/forgetpass',forgotPassword)
router.post(
  "/verify-forgot-password-otp",
  verifyForgotPasswordOtp
);

router.post("/refresh", refreshToken);
router.post("/reset-password", resetPassword);
export default router;