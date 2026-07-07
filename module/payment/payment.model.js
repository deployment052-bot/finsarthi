import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Unique Payment ID
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    // Merchant/Internal Reference
    merchantReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Loan
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      index: true,
    },

    // EMI
    emi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanEMI",
      required: true,
      index: true,
    },

    // Customer
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Amount
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    // Payment Source
    paymentSource: {
      type: String,
      enum: [
        "FINSARTHI_APP",
        "UPI",
        "BANK_TRANSFER",
        "BBPS",
        "AUTO_DEBIT",
        "CASH",
        "CHEQUE",
      ],
      default: "UPI",
    },

    // Gateway Name (Future)
    gateway: {
      type: String,
      default: null,
    },

    // Customer UTR / Transaction Reference
    utrNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    // Payment Screenshot
    paymentProof: {
      url: String,
      publicId: String,
    },

    // Payment Status
    status: {
      type: String,
      enum: [
        "CREATED",
        "UNDER_VERIFICATION",
        "SUCCESS",
        "FAILED",
        "REJECTED",
        "EXPIRED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "CREATED",
      index: true,
    },

    // Receipt Number
    receiptNumber: {
      type: String,
      default: null,
      index: true,
    },

    // Admin Verification
// Admin Verification
verification: {
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  verifiedAt: {
    type: Date,
  },

  remark: {
    type: String,
    trim: true,
  },

  ipAddress: {
    type: String,
    trim: true,
  },

  device: {
    type: String,
    trim: true,
  },
},

    // Expiry of Payment Intent
    expiresAt: {
      type: Date,
    },

    // Customer Note
    customerRemark: {
      type: String,
      trim: true,
    },

    // Metadata (Future Integrations)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

paymentSchema.index({ loan: 1 });

paymentSchema.index({ emi: 1 });

paymentSchema.index({ user: 1 });

paymentSchema.index({ status: 1 });

paymentSchema.index({ createdAt: -1 });

paymentSchema.index({ paymentSource: 1 });

paymentSchema.index(
  {
    loan: 1,
    emi: 1,
    status: 1,
  },
  {
    name: "loan_emi_status_index",
  }
);

export default mongoose.model("Payment", paymentSchema);