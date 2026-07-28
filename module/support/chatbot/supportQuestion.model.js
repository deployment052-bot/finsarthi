import mongoose from "mongoose";

const supportQuestionSchema = new mongoose.Schema(
  {
    // Category
    category: {
      type: String,
      enum: [
        "LOAN",
        "EMI",
        "PAYMENT",
        "TRANSACTION",
        "ACCOUNT",
        "KYC",
        "CARD",
        "APP",
        "OTHER",
      ],
      required: true,
      index: true,
    },

    // Question Order
    step: {
      type: Number,
      required: true,
      min: 1,
    },

    // Database Field Name
    field: {
      type: String,
      required: true,
      trim: true,
    },

    // Question
    question: {
      type: String,
      required: true,
      trim: true,
    },

    // Input Type
    type: {
      type: String,
      enum: [
        "TEXT",
        "TEXTAREA",
        "NUMBER",
        "DATE",
        "OPTIONS",
        "FILE",
        "PHONE",
        "EMAIL",
      ],
      required: true,
    },

    // Options (Only for OPTIONS)
    options: {
      type: [String],
      default: [],
    },

    // Validation
    required: {
      type: Boolean,
      default: true,
    },

    // Placeholder
    placeholder: {
      type: String,
      default: "",
    },

    // Example
    example: {
      type: String,
      default: "",
    },

    // Active Question
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// One Step Per Category
supportQuestionSchema.index(
  {
    category: 1,
    step: 1,
  },
  {
    unique: true,
  }
);

export const SupportQuestion = mongoose.model(
  "SupportQuestion",
  supportQuestionSchema
);