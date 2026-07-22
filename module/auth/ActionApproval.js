import mongoose from "mongoose";

const actionApprovalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
      index: true,
    },

    userType: {
      type: String,
      enum: ["Admin", "Employee", "User"],
      required: true,
    },

    action: {
      type: String,
      enum: [
        "LOGOUT_ALL_DEVICES",
        "DELETE_COMPANY",
        "DELETE_EMPLOYEE",
        "RESET_PASSWORD",
        "CHANGE_RECOVERY_EMAIL",
      ],
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    approved: {
      type: Boolean,
      default: false,
    },

    rejected: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    ip: String,

    userAgent: String,
  },
  {
    timestamps: true,
  }
);

actionApprovalSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
  }
);

export default mongoose.model(
  "ActionApproval",
  actionApprovalSchema
);