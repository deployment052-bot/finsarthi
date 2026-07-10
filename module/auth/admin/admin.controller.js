import mongoose from "mongoose";
import Admin from "./admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../../User/Employee_Schema.js";
import PasswordReset from "../../User/OTP.js";

import { generateOTP } from "./util/generateOTP.js";
import { sendEmail } from "./util/sendEmail.js";
import { forgotPasswordTemplate } from "./util/emailTemplate.js";
import Counteremp from "../../User/Counter.js";
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. find admin (password manually include)
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // 2. check status
    if (admin.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Admin blocked",
      });
    }

    // 3. password verify
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. update login time
    admin.lastLoginAt = new Date();
    await admin.save();

    // 5. generate JWT
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        permissions: admin.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const ROLE_PREFIX = {
  SUPER_ADMIN: "SA",
  ADMIN: "AD",
  MANAGER: "MA",
  VISITOR: "VI",
  CREDIT_ANALYST: "CR",
  DISBURSEMENT_OFFICER: "DO",
  COLLECTION_AGENT: "CA",
  CUSTOMER_SUPPORT: "CS",
  AUDITOR: "AU",
};

export const registerEmployee = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      fullName,
      email,
      mobile,
      password,
      role,
      designation,
      department,
      branch,
      reportingManager,
      gender,
      dateOfBirth,
    } = req.body;

    // ==========================
    // Validate Role
    // ==========================

    if (!ROLE_PREFIX[role]) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Invalid employee role",
      });
    }

    // ==========================
    // Duplicate Check
    // ==========================

    const exists = await Employee.findOne({
      $or: [{ mobile }, { email }],
    }).session(session);

    if (exists) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message: "Employee already exists",
      });
    }

    // ==========================
    // Generate Employee ID
    // ==========================

    const counter = await Counteremp.findOneAndUpdate(
      { key: role },
      {
        $inc: { sequence: 1 },
      },
      {
        new: true,
        upsert: true,
        session,
      },
    );

    const employeeId = `F${ROLE_PREFIX[role]}${String(
      counter.sequence,
    ).padStart(3, "0")}`;

    // ==========================
    // Hash Password
    // ==========================

    const hashedPassword = await bcrypt.hash(password, 12);

    // ==========================
    // Create Employee
    // ==========================

    const employee = await Employee.create(
      [
        {
          employeeId,

          fullName,

          email,

          mobile,

          password: hashedPassword,

          role,

          designation,

          department,

          branch,

          reportingManager,

          gender,

          dateOfBirth,

          createdBy: req.user.id,
        },
      ],
      {
        session,
      },
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Employee registered successfully",

      data: employee[0],
    });
  } catch (err) {
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    session.endSession();
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await Admin.findOne({
      email: normalizedEmail,
      status: "ACTIVE",
    });

    let userType = "ADMIN";

    if (!user) {
      user = await Employee.findOne({
        email: normalizedEmail,
        status: "ACTIVE",
      });

      userType = "EMPLOYEE";
    }

    // Security: Same response even if email doesn't exist
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, an OTP has been sent.",
      });
    }

    // Delete old OTPs
    await PasswordReset.deleteMany({
      email: normalizedEmail,
    });

    // Generate OTP
    const otp = generateOTP();

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save OTP
    await PasswordReset.create({
      email: normalizedEmail,
      userId: user._id,
      userType,
      otp: hashedOtp,
      verified: false,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    // Send Email
    await sendEmail({
      to: normalizedEmail,
      subject: "Reset Your FinSarthi Password",
      html: forgotPasswordTemplate(
        user.fullName || user.name || "User",
        otp
      ),
    });

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your registered email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otpRecord = await PasswordReset.findOne({
      email: normalizedEmail,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "OTP not found.",
      });
    }

    if (otpRecord.verified) {
      return res.status(400).json({
        success: false,
        message: "OTP already verified.",
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await PasswordReset.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    // Optional: Max attempts
    if (otpRecord.attempts >= 5) {
      await PasswordReset.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        success: false,
        message: "Maximum OTP attempts exceeded. Please request a new OTP.",
      });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    otpRecord.verified = true;
    otpRecord.attempts = 0;

    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // ==========================
    // Validation
    // ==========================

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ==========================
    // OTP Verification Check
    // ==========================

    const otpRecord = await PasswordReset.findOne({
      email: normalizedEmail,
      verified: true,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP verification required.",
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await PasswordReset.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    // ==========================
    // Find User
    // ==========================

    let user;

    if (otpRecord.userType === "ADMIN") {
      user = await Admin.findById(otpRecord.userId).select("+password");
    } else {
      user = await Employee.findById(otpRecord.userId).select("+password");
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==========================
    // Prevent Same Password
    // ==========================

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the old password.",
      });
    }

    // ==========================
    // Update Password
    // ==========================

    user.password = await bcrypt.hash(newPassword, 10);

    if (otpRecord.userType === "EMPLOYEE") {
      user.passwordChangedAt = new Date();
    }

    await user.save();

    // ==========================
    // Delete OTP
    // ==========================

    await PasswordReset.deleteMany({
      email: normalizedEmail,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};