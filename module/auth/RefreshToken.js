import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    // ==========================================
    // User Information
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
      index: true,
    },

    // Mongoose Model Name
    // Admin | Employee | User
    userType: {
      type: String,
      enum: ["Admin", "Employee", "User"],
      required: true,
      index: true,
    },

    // ==========================================
    // Token Information
    // ==========================================

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    familyId: {
      type: String,
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    parentToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RefreshToken",
      default: null,
    },

    // ==========================================
    // Device Information
    // ==========================================

    deviceId: {
      type: String,
      required: true,
      index: true,
    },

    deviceName: {
      type: String,
      default: "Unknown Device",
    },

    browser: {
      type: String,
      default: "Unknown",
    },

    platform: {
      type: String,
      default: "Unknown",
    },

    ip: {
      type: String,
    },

    userAgent: {
      type: String,
    },

    // ==========================================
    // Session State
    // ==========================================

    used: {
      type: Boolean,
      default: false,
    },

    revoked: {
      type: Boolean,
      default: false,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Indexes
// ==========================================

// Auto Delete Expired Tokens
refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Fast User Session Lookup
refreshTokenSchema.index({
  user: 1,
  userType: 1,
});

// Fast Device Lookup
refreshTokenSchema.index({
  user: 1,
  deviceId: 1,
});

// Refresh Token Family
refreshTokenSchema.index({
  familyId: 1,
});

// Current Session Lookup
refreshTokenSchema.index({
  sessionId: 1,
});

export default mongoose.model(
  "RefreshToken",
  refreshTokenSchema
);