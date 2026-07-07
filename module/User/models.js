import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      immutable: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
      immutable: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    mpin: {
      type: String,
      required: true,
    },

    lastLoginDevice: String,
    deviceType: String,
    fcmToken: String,
    lastLoginAt: Date,

    mobileVerified: {
      type: Boolean,
      default: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    monthlyIncome: {
      type: Number,
      default: 0,
    },

    settings: {
      biometricEnabled: {
        type: Boolean,
        default: false,
      },

      emailNotification: {
        type: Boolean,
        default: true,
      },

      pushNotification: {
        type: Boolean,
        default: true,
      },
    },

    role: {
      type: String,
      enum: [
        "CUSTOMER",
        "ADMIN",
        "KYC",
        "FIELD_OFFICER",
      ],
      default: "CUSTOMER",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },

    profileImage: String,
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;