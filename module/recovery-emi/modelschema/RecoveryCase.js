import mongoose from "mongoose";

const recoveryCaseSchema = new mongoose.Schema(
  {
    recoveryId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      immutable: true,
    },

    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      index: true,
    },

    emi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanEMI",
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    outstandingAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    totalCollectedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    penaltyAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    dpd: {
      type: Number,
      default: 0,
    },

    priority: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
      ],
      default: "LOW",
    },

    /**
     * Recovery Stage
     */
    stage: {
      type: String,
      enum: [
        "QUEUE",
        "ASSIGNED",
        "CALLING",
        "FIELD_VISIT",
        "PROMISE_TO_PAY",
        "PARTIAL_PAYMENT",
        "FAILED",
        "ESCALATED",
        "LEGAL",
        "SETTLED",
        "CLOSED",
      ],
      default: "QUEUE",
      index: true,
    },

    /**
     * Recovery Status
     */
    status: {
      type: String,
      enum: [
        "OPEN",
        "ASSIGNED",
        "IN_PROGRESS",
        "ON_HOLD",
        "COMPLETED",
        "CLOSED",
      ],
      default: "OPEN",
      index: true,
    },

    /**
     * Promise To Pay
     */
    promiseDetails: {
      amount: {
        type: Number,
        default: 0,
        min: 0,
      },

      promisedDate: {
        type: Date,
        default: null,
      },

      status: {
        type: String,
        enum: [
          "ACTIVE",
          "FULFILLED",
          "BROKEN",
        ],
        default: null,
      },

      createdAt: Date,

      brokenAt: Date,

      fulfilledAt: Date,
    },

    /**
     * Escalation Details
     */
    escalation: {
      reason: String,

      escalatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },

      escalatedAt: Date,
    },

    escalationRequired: {
      type: Boolean,
      default: false,
    },

    /**
     * Legal Details
     */
    legalRequired: {
      type: Boolean,
      default: false,
    },

    legalDetails: {
      advocateName: String,

      advocateContact: String,

      noticeNumber: String,

      initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },

      remark: String,
    },

    legalInitiatedAt: Date,

    nextFollowupDate: {
      type: Date,
      index: true,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },

    closedAt: Date,

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * ===========================
 * Indexes
 * ===========================
 */

// Agent Workload
recoveryCaseSchema.index({
  assignedAgent: 1,
  status: 1,
});

// Customer History
recoveryCaseSchema.index({
  customer: 1,
});

// Loan Search
recoveryCaseSchema.index({
  loan: 1,
});

// Promise Monitoring
recoveryCaseSchema.index({
  "promiseDetails.status": 1,
  "promiseDetails.promisedDate": 1,
});

// Dashboard
recoveryCaseSchema.index({
  stage: 1,
  status: 1,
});

// Followup Cron
recoveryCaseSchema.index({
  nextFollowupDate: 1,
});

// Priority Queue
recoveryCaseSchema.index({
  priority: 1,
  createdAt: -1,
});

const RecoveryCase =
  mongoose.models.RecoveryCase ||
  mongoose.model(
    "RecoveryCase",
    recoveryCaseSchema
  );

export default RecoveryCase;