import mongoose from "mongoose";

const loanProductSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC INFORMATION
    // ==========================================
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

    // ==========================================
    // LOAN CATEGORY
    // ==========================================
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
        "AGRICULTURE",
        "OTHER",
      ],
      default: "PERSONAL",
    },

    // ==========================================
    // LOAN PROCESSING
    // ==========================================
    processingType: {
      type: String,
      enum: ["INSTANT", "MANUAL"],
      required: true,
    },

    // ==========================================
    // LOAN AMOUNT
    // ==========================================
    minAmount: {
      type: Number,
      required: true,
    },

    maxAmount: {
      type: Number,
      required: true,
    },

    // ==========================================
    // LOAN TENURE
    // ==========================================
    minTenure: {
      type: Number,
      required: true,
    },

    maxTenure: {
      type: Number,
      required: true,
    },

    // ==========================================
    // INTEREST
    // ==========================================
    interestRate: {
      type: Number,
      required: true,
    },

    interestType: {
      type: String,
      enum: ["FLAT", "REDUCING"],
      default: "FLAT",
    },

    // ==========================================
    // EMI FREQUENCY
    // ==========================================
    emiFrequency: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY"],
      default: "MONTHLY",
    },

    // ==========================================
    // CHARGES
    // ==========================================
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

    // ==========================================
    // ELIGIBILITY
    // ==========================================
    minRiskScore: {
      type: Number,
      default: 700,
    },

    maxActiveLoans: {
      type: Number,
      default: 1,
    },

    // ==========================================
    // LOAN BEHAVIOUR
    // ==========================================
    instantDisbursement: {
      type: Boolean,
      default: false,
    },

    requiresPhysicalVerification: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // OVERDUE CONFIGURATION
    // ==========================================
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

    // ==========================================
    // DYNAMIC FRONTEND FORM CONFIGURATION
    // ==========================================
    formConfiguration: {
      fields: {
        type: mongoose.Schema.Types.Mixed,
        default: [],
      },

      documents: {
        type: mongoose.Schema.Types.Mixed,
        default: [],
      },
    },

    // ==========================================
    // STATUS
    // ==========================================
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