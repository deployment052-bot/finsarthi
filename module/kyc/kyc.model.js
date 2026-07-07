import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
    },

    // Aadhaar & PAN
    aadhaarNumber: {
      type: String,
      trim: true,
    },

    aadhaarVerified: {
      type: Boolean,
      default: false,
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    panVerified: {
      type: Boolean,
      default: false,
    },

    // Personal Details
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    fatherName: String,

    motherName: String,

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },

    // Employment Details
    occupation: {
      type: String,
      enum: [
        "SALARIED",
        "SELF_EMPLOYED",
        "STUDENT",
        "HOMEMAKER",
        "RETIRED",
        "OTHER",
      ],
      default: "OTHER",
    },

    monthlyIncome: {
      type: Number,
      default: 0,
      min: 0,
    },

    annualIncome: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Address
    addressLine: String,

    city: String,

    state: String,

    pinCode: String,

    // KYC Source
    method: {
      type: String,
      enum: ["MANUAL", "DIGILOCKER"],
      default: "MANUAL",
    },

    // Verification Status
    status: {
      type: String,
      enum: [
        "PENDING",
        "UNDER_REVIEW",
        "VERIFIED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    remarks: String,

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

const KYC =
  mongoose.models.KYC ||
  mongoose.model("KYC", kycSchema);

export default KYC;