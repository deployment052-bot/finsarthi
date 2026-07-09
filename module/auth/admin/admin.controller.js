import Admin from "./admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../../User/Employee_Schema.js";
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
