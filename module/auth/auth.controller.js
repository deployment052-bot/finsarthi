import bcrypt from "bcryptjs";
import {
  registerService,
  sendOtpService,
  verifyOtpService,
  loginService,
} from "../auth/auth.service.js";

/**
 * SEND OTP
 */
export const sendOtp = async (req, res) => {
  try {
    const result = await sendOtpService(req.body);

    return res.status(200).json({
      success: true,
      message: result.message,
      ...(process.env.NODE_ENV === "development" &&
        result.otp && {
          data: { otp: result.otp },
        }),
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * VERIFY OTP
 * (NO TOKEN HERE - BEST PRACTICE)
 */
export const verifyOtp = async (req, res) => {
  try {
    const result = await verifyOtpService(req.body);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        isRegistered: result.isRegistered,
        ...(result.user && { user: result.user }),
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * REGISTER (MPIN SET + TOKEN ISSUE)
 */
export const register = async (req, res) => {
   console.log("BODY:", req.body);
  try {
    const result = await registerService(req.body);

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Registration failed",
    });
  }
};

/**
 * LOGIN CONTROLLER
 */
export const login = async (req, res) => {
  try {
    const result = await loginService(req.body);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Login failed",
    });
  }
};



export const sendForgotOtp = async (req, res) => {
  try {
    const result = await sendForgotOtpService(req.body);

    return res.status(200).json({
      success: true,
      message: result.message,
      ...(process.env.NODE_ENV === "development" &&
        result.otp && {
          data: {
            otp: result.otp,
          },
        }),
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * ===============================
 * VERIFY FORGOT OTP
 * ===============================
 */
export const verifyForgotOtp = async (req, res) => {
  try {
    const result = await verifyForgotOtpService(req.body);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        resetToken: result.resetToken,
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

/**
 * ===============================
 * RESET MPIN
 * ===============================
 */
export const resetMpin = async (req, res) => {
  try {
    const result = await resetMpinService(req.body);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};