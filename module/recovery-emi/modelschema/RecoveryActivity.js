import mongoose from "mongoose";

const recoveryActivitySchema = new mongoose.Schema(
  {
    /**
     * Recovery Case
     */
    recoveryCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecoveryCase",
      required: true,
      index: true,
    },

    /**
     * Who performed this activity
     */
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "actorModel",
      default: null,
    },

    /**
     * Actor Type
     */
    actorModel: {
      type: String,
      enum: [
        "Admin",
        "Employee",
        "System",
      ],
      default: "System",
    },

    /**
     * Activity Type
     */
    activityType: {
      type: String,
      enum: [
        "CASE_CREATED",
        "CASE_ASSIGNED",
        "STARTED",
        "CALL",
        "VISIT",
        "FOLLOWUP",
        "SMS",
        "EMAIL",
        "WHATSAPP",
        "PROMISE_TO_PAY",
        "PAYMENT",
        "PARTIAL_PAYMENT",
        "REMARK",
        "ESCALATED",
        "LEGAL_NOTICE",
        "CLOSED",
      ],
      required: true,
      index: true,
    },

    /**
     * Remark
     */
    remark: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Call / Visit Outcome
     */
    outcome: {
      type: String,
      enum: [
        "SUCCESS",
        "FAILED",
        "NO_RESPONSE",
        "NOT_AVAILABLE",
        "CUSTOMER_REFUSED",
        "PARTIAL_PAYMENT",
        "FULL_PAYMENT",
        "PROMISE",
      ],
      default: null,
    },

    /**
     * Visit Status
     */
    visitStatus: {
      type: String,
      enum: [
        "HOME_VISITED",
        "CUSTOMER_MET",
        "CUSTOMER_NOT_FOUND",
        "LOCKED",
        "SHIFTED",
        "REFUSED",
      ],
      default: null,
    },

    /**
     * Payment Amount
     */
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Promise Details
     */
    promisedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    promisedDate: {
      type: Date,
      default: null,
    },

    /**
     * GPS Location
     */
    location: {

      latitude: Number,

      longitude: Number,

      address: String,

    },

    /**
     * Visit Images
     */
    images: [

      {

        url: String,

        publicId: String,

      },

    ],

    /**
     * Audio Recording
     */
    audio: {

      url: String,

      publicId: String,

    },

    /**
     * Next Followup
     */
    nextFollowupDate: {
      type: Date,
      default: null,
    },

    /**
     * Device Details
     */
    deviceInfo: {

      deviceId: String,

      platform: String,

      ip: String,

    },

    /**
     * Extra Metadata
     */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * ==========================
 * Indexes
 * ==========================
 */

// Timeline
recoveryActivitySchema.index({
  recoveryCase: 1,
  createdAt: -1,
});

// Agent Report
recoveryActivitySchema.index({
  actor: 1,
  activityType: 1,
});

// Followup
recoveryActivitySchema.index({
  nextFollowupDate: 1,
});

// Payment Report
recoveryActivitySchema.index({
  activityType: 1,
  amount: 1,
});

// Promise Tracking
recoveryActivitySchema.index({
  promisedDate: 1,
});

const RecoveryActivity =
  mongoose.models.RecoveryActivity ||
  mongoose.model(
    "RecoveryActivity",
    recoveryActivitySchema
  );

export default RecoveryActivity;