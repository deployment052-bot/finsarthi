import mongoose from "mongoose";

const loanEMISchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      index: true,
    },

    emiId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    installmentNumber: {
      type: Number,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
      index: true,
    },

    emiAmount: {
      type: Number,
      required: true,
    },

    principalAmount: {
      type: Number,
      required: true,
    },

    interestAmount: {
      type: Number,
      required: true,
    },

    penaltyAmount: {
      type: Number,
      default: 0,
    },

    totalDueAmount: {
      type: Number,
      required: true,
    },

    outstandingAmount: {
      type: Number,
      required: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    paymentDate: {
      type: Date,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    attemptCount: {
  type: Number,
  default: 1,
},

lastAttemptAt: {
  type: Date,
  default: Date.now,
},

verifiedAmount: {
  type: Number,
  default: 0,
},

failureReason: {
  type: String,
  trim: true,
},

refundAmount: {
  type: Number,
  default: 0,
},

    status: {
      type: String,
      enum: [
        "UPCOMING",
        "DUE",
        "PARTIAL",
        "PAID",
        "OVERDUE",
        "WAIVED",
      ],
      default: "UPCOMING",
      index: true,
    },

    isClosed: {
      type: Boolean,
      default: false,
    },
    overdueDays: {
  type: Number,
  default: 0,
},

lastPenaltyCalculatedAt: {
  type: Date,
},

penaltyStopped: {
  type: Boolean,
  default: false,
},

    remarks: String,

    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LoanEMI", loanEMISchema);