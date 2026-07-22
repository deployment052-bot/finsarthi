import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  registerService,
  sendOtpService,
  verifyOtpService,
  loginService,
} from "../auth/auth.service.js";
import Employee from "../User/Employee_Schema.js";
import { refreshTokenService } from "./service/refresh.service.js";
import RefreshToken from "./RefreshToken.js";
import Admin from "./admin/admin.model.js";

import User from "../User/models.js";
import { createSession } from "./service/createSession.js";
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
    const result = await loginService({
      ...req.body,
      req,
    });

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


const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 Minutes

export const employeeLogin = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and password are required",
      });
    }

    // Find Employee
    const employee = await Employee.findOne({
      employeeId: employeeId.toUpperCase(),
    }).select("+password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check Status
    if (employee.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Employee account is inactive",
      });
    }

    // ===========================
    // Auto Unlock After Lock Time
    // ===========================

    if (
      employee.loginLockedUntil &&
      employee.loginLockedUntil <= new Date()
    ) {
      employee.loginAttempts = 0;
      employee.loginLockedUntil = null;
      await employee.save();
    }

    // ===========================
    // Account Locked
    // ===========================

    if (
      
      employee.loginLockedUntil &&
      employee.loginLockedUntil > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Account is locked due to multiple failed login attempts. Please try again after 30 minutes.",
      });
    }

    // ===========================
    // Password Verify
    // ===========================

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      employee.loginAttempts += 1;

      if (employee.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        employee.loginLockedUntil = new Date(Date.now() + LOCK_TIME);
      }

      await employee.save();

      const remainingAttempts = Math.max(
        0,
        MAX_LOGIN_ATTEMPTS - employee.loginAttempts
      );

      return res.status(401).json({
        success: false,
        message:
          remainingAttempts > 0
            ? `Invalid Employee ID or Password. ${remainingAttempts} attempt(s) remaining.`
            : "Account locked for 30 minutes due to multiple failed login attempts.",
      });
    }

    // ===========================
    // Reset Attempts
    // ===========================

    employee.loginAttempts = 0;
    employee.loginLockedUntil = null;
    employee.lastLogin = new Date();

    await employee.save();

    // ===========================
    // Generate Tokens
    // ===========================

  const { accessToken, refreshToken } =
  await createSession({
    user: employee,
    req,
    userType: "Employee", // Mongoose Model Name
  });

    return res.status(200).json({
      success: true,
      message: "Employee login successful",
      data: {
        id: employee._id,
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        role: employee.role,
        designation: employee.designation,
        department: employee.department,
        branch: employee.branch,
        profileImage: employee.profileImage,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



export const refreshToken = async (req, res) => {
  try {
    const result = await refreshTokenService({
      refreshToken: req.body.refreshToken,
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};


export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    const tokenHash = hashToken(refreshToken);

    await RefreshToken.findOneAndUpdate(
      { tokenHash },
      {
        revoked: true,
        used: true,
        lastUsedAt: new Date(),
      }
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



const EMPLOYEE_ROLES = [
  "SUPER_ADMIN",
  "MANAGER",
  "VISITOR",
  "CREDIT_ANALYST",
  "DISBURSEMENT_OFFICER",
  "COLLECTION_AGENT",
  "CUSTOMER_SUPPORT",
  "AUDITOR",
];

export const logoutAllDevices = async (req, res) => {
  try {
    let user;

    if (req.role === "ADMIN") {
      user = await Admin.findById(req.user._id);
    } else if (EMPLOYEE_ROLES.includes(req.role)) {
      user = await Employee.findById(req.user._id);
    } else {
      user = await User.findById(req.user._id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Invalidate all access tokens
    user.tokenVersion += 1;
    await user.save();

    // Revoke all refresh tokens
    await RefreshToken.updateMany(
      { user: user._id },
      {
        $set: {
          revoked: true,
          used: true,
          lastUsedAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



export const getMySessions = async (req, res) => {
  try {
    const EMPLOYEE_ROLES = [
      "SUPER_ADMIN",
      "MANAGER",
      "VISITOR",
      "CREDIT_ANALYST",
      "DISBURSEMENT_OFFICER",
      "COLLECTION_AGENT",
      "CUSTOMER_SUPPORT",
      "AUDITOR",
    ];

    let userType = "User";

    if (req.role === "ADMIN") {
      userType = "Admin";
    } else if (EMPLOYEE_ROLES.includes(req.role)) {
      userType = "Employee";
    }

    console.log("========== SESSION DEBUG ==========");
    console.log("User ID :", req.user._id);
    console.log("Role :", req.role);
    console.log("UserType :", userType);

    const sessions = await RefreshToken.find({
      user: req.user._id,
      userType,
      revoked: false,
    })
      .sort({ lastUsedAt: -1 })
      .select(
        "_id sessionId deviceName browser platform ip lastUsedAt createdAt revoked expiresAt deviceId"
      );

    return res.status(200).json({
      success: true,
      totalSessions: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};