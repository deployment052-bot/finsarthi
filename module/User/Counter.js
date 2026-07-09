import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    sequence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Counteremp =
  mongoose.models.Counter ||
  mongoose.model("Counteremp", counterSchema);

export default Counteremp;