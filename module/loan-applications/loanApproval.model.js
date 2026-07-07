import mongoose from "mongoose";

const loanApprovalSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      index: true,
    },

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    level: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
      ],
      default: "PENDING",
      index: true,
    },

    approvedAmount: {
      type: Number,
      default: 0,
    },

    approvedTenure: {
      type: Number,
      default: 0,
    },

    interestRate: {
      type: Number,
      default: 0,
    },

    processingFee: {
      type: Number,
      default: 0,
    },

    remarks: String,

    rejectionReason: String,

    approvedAt: Date,

    expiresAt: Date,

    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "LoanApproval",
  loanApprovalSchema
);