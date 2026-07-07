import mongoose from "mongoose";

const loanTimelineSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      index: true,
    },

    stage: {
      type: String,
      required: true,
    },

    status: String,

    remarks: String,

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    metadata: {
      ip: String,
      device: String,
      browser: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "LoanTimeline",
  loanTimelineSchema
);