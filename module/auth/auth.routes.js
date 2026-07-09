import express from "express";
import {
  sendOtp,
  verifyOtp,
  register,
  login,employeeLogin
} from "./auth.controller.js";
import {adminLogin }from "./admin/admin.controller.js"
const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", register);
router.post('/login',login)

router.post('/admin-login',adminLogin)
router.post("/employee/login", employeeLogin);
export default router;