import mongoose from "mongoose";

const loanApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    loanNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanProduct",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    approvedAmount: {
      type: Number,
      default: 0,
    },

    disbursedAmount: {
      type: Number,
      default: 0,
    },

    outstandingAmount: {
      type: Number,
      default: 0,
    },

    interestRate: {
      type: Number,
      required: true,
    },

    tenure: {
      type: Number,
      required: true,
    },

    emiAmount: {
      type: Number,
      default: 0,
    },

    totalInterest: {
      type: Number,
      default: 0,
    },

    totalPayable: {
      type: Number,
      default: 0,
    },

    stage: {
      type: String,
      enum: [
        "APPLICATION",
        "ELIGIBILITY",
        "RISK",
        "VISITOR_VERIFICATION",
        "ADMIN_REVIEW",
        "APPROVAL",
        "DISBURSEMENT",
        "ACTIVE",
        "CLOSED",
      ],
      default: "APPLICATION",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "VISITOR_ASSIGNED",
        "VISITOR_IN_PROGRESS",
        "UNDER_REVIEW",
        "DOCUMENT_PENDING",
        "APPROVED",
        "REJECTED",
        "DISBURSEMENT_PENDING",
        "DISBURSED",
        "ACTIVE",
        "OVERDUE",
        "SETTLED",
        "FORECLOSED",
        "WRITTEN_OFF",
        "CLOSED",
      ],
      default: "SUBMITTED",
      index: true,
    },

    productSnapshot: {
      code: String,
      loanType: String,
      segment: String,
      displayName: String,
    },

    assignedVisitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },

    visitorAssignedAt: {
      type: Date,
      default: null,
    },

    approval: {
      status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
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

      remarks: String,

      rejectionReason: {
        code: String,
        message: String,
      },
    },
documents: [
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentMaster",
      required: true,
    },

    file: {
      type: String,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      default: "",
    },
  },
],
applicationData: {
  type: mongoose.Schema.Types.Mixed,
  default: null,
},
    riskSnapshot: {
      score: Number,
      grade: String,
      approvedLimit: Number,
      engineVersion: String,
    },

    creditSnapshot: {
      bureau: String,
      score: Number,
      activeLoans: Number,
      overdueAmount: Number,
      enquiries: Number,
      reportId: String,
    },

    disbursementStatus: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    emiSummary: {
      totalInstallments: {
        type: Number,
        default: 0,
      },

      paidInstallments: {
        type: Number,
        default: 0,
      },

      pendingInstallments: {
        type: Number,
        default: 0,
      },

      overdueInstallments: {
        type: Number,
        default: 0,
      },

      nextDueDate: Date,

      nextEMIAmount: Number,
    },

    version: {
      type: Number,
      default: 1,
    },

    remarks: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

loanApplicationSchema.index({
  customer: 1,
  status: 1,
});

loanApplicationSchema.index({
  assignedVisitor: 1,
  status: 1,
});

loanApplicationSchema.index({
  stage: 1,
  status: 1,
});

export default mongoose.model(
  "LoanApplication",
  loanApplicationSchema
);