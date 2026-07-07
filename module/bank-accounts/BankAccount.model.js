import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    branchName: {
      type: String,
      trim: true,
    },

    accountType: {
      type: String,
      enum: ["SAVINGS", "CURRENT"],
      default: "SAVINGS",
    },

    isPrimary: {
      type: Boolean,
      default: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verificationMethod: {
      type: String,
      enum: ["PENNY_DROP", "MANUAL", "NPCI"],
      default: "MANUAL",
    },

    verificationReference: {
      type: String,
    },

    verificationMessage: {
      type: String,
    },

    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    rejectedReason: {
      type: String,
    },

    verifiedAt: {
      type: Date,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BankAccount", bankAccountSchema);