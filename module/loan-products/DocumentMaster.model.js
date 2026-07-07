import mongoose from "mongoose";

const documentMasterSchema = new mongoose.Schema(
  {
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

    allowedTypes: {
      type: [String],
      default: ["pdf", "jpg", "jpeg", "png"],
    },

    maxSizeMB: {
      type: Number,
      default: 5,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("DocumentMaster", documentMasterSchema);