import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    userType: {
      type: String,
      enum: ["ADMIN", "EMPLOYEE", "USER"],
      required: true,
    },

    purpose: {
      type: String,
      enum: [
        "LOGIN",
        "PASSWORD_RESET",
        "EMAIL_VERIFICATION",
        "LOGOUT_ALL",
        "CHANGE_EMAIL",
      ],
      required: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
  }
);

const Otp =
  mongoose.models.Otp || mongoose.model("Otp", otpSchema);

export default Otp;