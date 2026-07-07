import mongoose from "mongoose";

const loanProductSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    // Loan Category
    category: {
      type: String,
      enum: [
        "PERSONAL",
        "BUSINESS",
        "HOME",
        "GOLD",
        "EDUCATION",
        "VEHICLE",
        "RENOVATION",
        "OTHER",
      ],
      default: "PERSONAL",
    },

    // Loan Processing
    processingType: {
      type: String,
      enum: ["INSTANT", "MANUAL"],
      required: true,
    },

    // Loan Amount
    minAmount: {
      type: Number,
      required: true,
    },

    maxAmount: {
      type: Number,
      required: true,
    },

    // Loan Tenure (Months)
    minTenure: {
      type: Number,
      required: true,
    },

    maxTenure: {
      type: Number,
      required: true,
    },

    // Interest
    interestRate: {
      type: Number,
      required: true,
    },

    interestType: {
      type: String,
      enum: ["FLAT", "REDUCING"],
      default: "FLAT",
    },

    // EMI Frequency
    emiFrequency: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY"],
      default: "MONTHLY",
    },

    // Charges
    processingFee: {
      type: Number,
      default: 0,
    },

    processingFeeType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED"],
      default: "PERCENTAGE",
    },

    gstPercentage: {
      type: Number,
      default: 18,
    },

    // Eligibility
    minRiskScore: {
      type: Number,
      default: 700,
    },

    maxActiveLoans: {
      type: Number,
      default: 1,
    },

    // Loan Behaviour
    instantDisbursement: {
      type: Boolean,
      default: false,
    },

    requiresPhysicalVerification: {
      type: Boolean,
      default: false,
    },

    // Overdue Configuration
    overdue: {
      enabled: {
        type: Boolean,
        default: true,
      },

      type: {
        type: String,
        enum: ["FIXED", "PERCENTAGE"],
        default: "PERCENTAGE",
      },

      value: {
        type: Number,
        default: 10,
      },

      graceDays: {
        type: Number,
        default: 0,
      },

      maxPenaltyPercentage: {
        type: Number,
        default: 500,
      },
    },

    // Status
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LoanProduct", loanProductSchema);