import mongoose from "mongoose";

const loanDisbursementSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    provider: {
      type: String,
      enum: [
        "RAZORPAYX",
        "CASHFREE",
        "PAYTM",
        "MANUAL",
      ],
      default: "MANUAL",
    },

    transactionReference: {
      type: String,
      unique: true,
      sparse: true,
    },

    utr: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "SUCCESS",
        "FAILED",
        "REVERSED",
      ],
      default: "PENDING",
      index: true,
    },

    failureReason: String,

    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    processedAt: Date,

    metadata: {
      gatewayResponse: mongoose.Schema.Types.Mixed,
    },

    remarks: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "LoanDisbursement",
  loanDisbursementSchema
);