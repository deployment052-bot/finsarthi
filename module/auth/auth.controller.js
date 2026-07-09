import bcrypt from "bcryptjs";
import {
  registerService,
  sendOtpService,
  verifyOtpService,
  loginService,
} from "../auth/auth.service.js";
import Employee from "../User/Employee_Schema.js";
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

    // Compare Password
    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Employee ID or Password",
      });
    }

    // Update Last Login
    employee.lastLogin = new Date();
    await employee.save();

    // Generate JWT
    const accessToken = jwt.sign(
      {
        id: employee._id,
        employeeId: employee.employeeId,
        role: employee.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: employee._id,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      }
    );

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