import mongoose from "mongoose";

const governmentSchemeSchema = new mongoose.Schema(
  {
    schemeId: {
      type: String,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    shortDescription: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
      index: true,
    },

    ministry: {
      type: String,
      default: "",
    },

    schemeType: {
      type: String,
      enum: ["CENTRAL", "STATE"],
      default: "CENTRAL",
    },

    state: {
      type: String,
      default: "ALL",
    },

    eligibility: [
      {
        type: String,
      },
    ],

    benefits: [
      {
        type: String,
      },
    ],

    documents: [
      {
        type: String,
      },
    ],

    officialWebsite: {
      type: String,
      default: "",
    },

    applyUrl: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    tags: [
      {
        type: String,
      },
    ],

    source: {
      type: String,
      default: "",
    },

    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "GovernmentScheme",
  governmentSchemeSchema
);