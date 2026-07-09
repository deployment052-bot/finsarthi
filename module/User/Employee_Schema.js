import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    profileImage: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "ADMIN",
        "MANAGER",
        "VISITOR",
        "CREDIT_ANALYST",
        "DISBURSEMENT_OFFICER",
        "COLLECTION_AGENT",
        "CUSTOMER_SUPPORT",
        "AUDITOR",
      ],
      required: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      enum: [
        "ADMIN",
        "OPERATIONS",
        "CREDIT",
        "COLLECTION",
        "FINANCE",
        "SUPPORT",
        "HR",
      ],
    },

    branch: {
      type: String,
      trim: true,
    },

    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },

    dateOfBirth: Date,

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"],
      default: "FULL_TIME",
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "INACTIVE",
        "ON_LEAVE",
        "SUSPENDED",
        "RESIGNED",
      ],
      default: "ACTIVE",
    },

    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },

    emergencyContact: {
      name: String,
      relation: String,
      mobile: String,
    },

    permissions: [
      {
        type: String,
      },
    ],

    lastLogin: Date,

    passwordChangedAt: Date,

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;