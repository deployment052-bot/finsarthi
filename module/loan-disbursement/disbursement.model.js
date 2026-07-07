import mongoose from "mongoose";
import { DISBURSEMENT_STATUS, DISBURSEMENT_METHOD } from "./disbursement.constants.js";

const disbursementSchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: Object.values(DISBURSEMENT_METHOD),
      default: DISBURSEMENT_METHOD.BANK_TRANSFER,
    },

    status: {
      type: String,
      enum: Object.values(DISBURSEMENT_STATUS),
      default: DISBURSEMENT_STATUS.INITIATED,
    },

    bankDetails: {
      accountNumber: String,
      ifsc: String,
      accountHolderName: String,
    },

    utrNumber: {
      type: String,
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Disbursement", disbursementSchema);