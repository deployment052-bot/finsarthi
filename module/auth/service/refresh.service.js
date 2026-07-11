import Admin from "../admin/admin.model.js";
import Employee from "../../User/Employee_Schema.js";
import User from "../../User/models.js";

import RefreshToken from "../RefreshToken.js";

import { verifyRefreshToken } from "../utils/jwt.js";
import { hashToken } from "../utils/hashToken.js";

export const refreshTokenService = async ({
  refreshToken,
  req,
}) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required.");
  }

  // ==========================================
  // Verify JWT
  // ==========================================

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new Error("Invalid or expired refresh token.");
  }

  // ==========================================
  // Find Session
  // ==========================================

  const tokenHash = hashToken(refreshToken);

  const session = await RefreshToken.findOne({
    tokenHash,
  });

  if (!session) {
    throw new Error("Session not found.");
  }

  // ==========================================
  // Revoked
  // ==========================================

  if (session.revoked) {
    throw new Error("Session revoked.");
  }

  // ==========================================
  // Already Used
  // ==========================================

  if (session.used) {
    throw new Error(
      "Refresh token already used. Please login again."
    );
  }

  // ==========================================
  // Expired
  // ==========================================

  if (session.expiresAt < new Date()) {
    throw new Error("Refresh token expired.");
  }

  // ==========================================
  // Find User
  // ==========================================

  let user = null;

  switch (session.userType) {
    case "ADMIN":
      user = await Admin.findById(session.user);
      break;

    case "EMPLOYEE":
      user = await Employee.findById(session.user);
      break;

    default:
      user = await User.findById(session.user);
      break;
  }

  if (!user) {
    throw new Error("User not found.");
  }

  // ==========================================
  // Token Version Check
  // ==========================================

  if (
    user.tokenVersion !== undefined &&
    payload.tokenVersion !== user.tokenVersion
  ) {
    throw new Error("Session expired. Please login again.");
  }

  // ==========================================
  // Part-2
  // ==========================================
  // ==========================================
// Mark Current Refresh Token Used
// ==========================================

session.used = true;
session.lastUsedAt = new Date();

await session.save();

// ==========================================
// Create New Session (Rotation)
// ==========================================

const { accessToken, refreshToken: newRefreshToken } =
  await createSession({
    user,
    req,
    userType: session.userType,
  });

// ==========================================
// Optional Cleanup
// ==========================================

// Agar sirf ek active session per device rakhna hai,
// to purana token revoke bhi kar sakte ho.

session.revoked = true;
await session.save();

// ==========================================
// Return
// ==========================================

return {
  accessToken,
  refreshToken: newRefreshToken,
};

  return {
    session,
    user,
  };
};