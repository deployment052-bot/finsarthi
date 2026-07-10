import jwt from "jsonwebtoken";

import User from "../module/User/models.js";
import Admin from "../module/auth/admin/admin.model.js";
import Employee from "../module/User/Employee_Schema.js";

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

export const protect = async (req, res, next) => {
  try {
    let token;

    // ===========================================
    // GET TOKEN
    // ===========================================

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // ===========================================
    // VERIFY TOKEN
    // ===========================================

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    // ===========================================
    // ADMIN
    // ===========================================

    if (decoded.role === "ADMIN") {
      user = await Admin.findById(decoded.id).select("-password");
    }

    // ===========================================
    // EMPLOYEE
    // ===========================================

    else if (EMPLOYEE_ROLES.includes(decoded.role)) {
      user = await Employee.findById(decoded.id).select("-password");
    }

    // ===========================================
    // CUSTOMER
    // ===========================================

    else {
      user = await User.findById(decoded.id).select("-mpin");
    }

    // ===========================================
    // USER NOT FOUND
    // ===========================================

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ===========================================
    // OPTIONAL STATUS CHECK FOR EMPLOYEES
    // ===========================================

    if (
      EMPLOYEE_ROLES.includes(decoded.role) &&
      user.status !== "ACTIVE"
    ) {
      return res.status(403).json({
        success: false,
        message: "Employee account is inactive",
      });
    }

    // ===========================================
    // ATTACH USER
    // ===========================================

    req.user = user;
    req.role = decoded.role;

    next();
  } catch (error) {
    console.error("Auth Error:", error);

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};