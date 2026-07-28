import mongoose from "mongoose";

const supportChatSessionSchema = new mongoose.Schema(
  {
    // Logged In User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Chat Type
    mode: {
      type: String,
      enum: ["COMPLAINT", "INQUIRY"],
      default: null,
    },
// Inquiry Type
inquiryType: {
  type: String,
  enum: [
    "COMPLAINT_STATUS",
    "LOAN_STATUS",
    "EMI_STATUS",
    "GOVERNMENT_SCHEME",
  ],
  default: null,
},
    // Chat Status
    status: {
      type: String,
      enum: [
        "ACTIVE",
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
      ],
      default: "ACTIVE",
      index: true,
    },


    // Current Question Index
    // QUESTIONS array is 0 based
    currentStep: {
      type: Number,
      default: 0,
      min: 0,
    },


    // Current Question Field
    currentField: {
      type: String,
      default: null,
    },


    // Dynamic Chat Answers
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },


    // Generated Ticket Reference
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },


    // Session Expiry
    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 30 * 60 * 1000),
      index: true,
    },

  },
  {
    timestamps: true,
  }
);


// One Active Chat Session Per User
supportChatSessionSchema.index(
  {
    user: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "ACTIVE",
    },
  }
);


export const SupportChatSession =
  mongoose.model(
    "SupportChatSession",
    supportChatSessionSchema
  );