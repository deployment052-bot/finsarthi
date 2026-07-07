import mongoose from "mongoose";

const loanReviewSchema = new mongoose.Schema(
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
      index: true,
    },

    reviewType: {
      type: String,
      enum: [
        "AUTO",
        "MANUAL",
        "RISK",
        "CREDIT",
        "OPERATIONS",
        "FINAL_APPROVAL",
      ],
      default: "MANUAL",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "REOPENED",
      ],
      default: "PENDING",
      index: true,
    },

  recommendation: {
    type: String,
    enum: [
        "APPROVE",
        "REJECT",
        "REFER",
        "REVISIT",
        "NEED_MORE_DOCUMENTS"
    ],
    default: "REFER"
},

    decision: {
      approved: {
        type: Boolean,
        default: false,
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
    },

    checklist: {
      kycVerified: {
        type: Boolean,
        default: false,
      },

      bankVerified: {
        type: Boolean,
        default: false,
      },

      documentsVerified: {
        type: Boolean,
        default: false,
      },

      bureauVerified: {
        type: Boolean,
        default: false,
      },

      fraudChecked: {
        type: Boolean,
        default: false,
      },

      incomeVerified: {
        type: Boolean,
        default: false,
      },

      employmentVerified: {
        type: Boolean,
        default: false,
      },
    },

    riskSnapshot: {
      score: Number,

      grade: String,

      approvedLimit: Number,

      engineVersion: String,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    reviewedAt: Date,

    completedAt: Date,

    isLatest: {
      type: Boolean,
      default: true,
      index: true,
    },

    version: {
      type: Number,
      default: 1,
    },

    metadata: {
      ipAddress: String,

      device: String,

      browser: String,
    },
  },
  {
    timestamps: true,
  }
);

/*
 One active review per reviewer per loan.
*/
loanReviewSchema.index(
  {
    loan: 1,
    reviewer: 1,
    isLatest: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "LoanReview",
  loanReviewSchema
);