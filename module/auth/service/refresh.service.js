import Admin from "../admin/admin.model.js";
import Employee from "../../User/Employee_Schema.js";
import User from "../../User/models.js";

import RefreshToken from "../RefreshToken.js";
import { createSession } from "./createSession.js";
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

  console.log("\n========== JWT PAYLOAD ==========");
  console.log(payload);
  console.log("=================================\n");

  // ==========================================
  // Find Session
  // ==========================================

  const tokenHash = hashToken(refreshToken);

  const session = await RefreshToken.findOne({
    tokenHash,
  });

  console.log("\n========== SESSION ==========");
  console.log(session);
  console.log("=============================\n");

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
  // Debug
  // ==========================================

  console.log("\n========== FIND USER ==========");
  console.log("session.user      :", session.user);
  console.log("session.userType  :", session.userType);
  console.log("payload.sub       :", payload.sub);
  console.log("payload.tokenVersion :", payload.tokenVersion);
  console.log("===============================\n");

  // ==========================================
  // Find User
  // ==========================================

 let user = null;

const userType = String(session.userType).trim().toLowerCase();

switch (userType) {
  case "admin":
    console.log("Searching Admin...");
    user = await Admin.findById(session.user);
    break;

  case "employee":
    console.log("Searching Employee...");
    user = await Employee.findById(session.user);
    break;

  case "user":
    console.log("Searching User...");
    user = await User.findById(session.user);
    break;

  default:
    console.error("Invalid userType:", session.userType);
    throw new Error(`Invalid userType: ${session.userType}`);
}


  console.log("\n========== USER ==========");
  console.log(user);
  console.log("==========================\n");

  if (!user) {
    throw new Error("User not found.");
  }

  // ==========================================
  // Token Version Check
  // ==========================================

  console.log(
    "JWT Token Version :",
    payload.tokenVersion
  );

  console.log(
    "DB Token Version  :",
    user.tokenVersion
  );

  if (
    user.tokenVersion !== undefined &&
    payload.tokenVersion !== user.tokenVersion
  ) {
    throw new Error("Session expired. Please login again.");
  }

  // ==========================================
  // Mark Current Refresh Token Used
  // ==========================================

  session.used = true;
  session.lastUsedAt = new Date();

  await session.save();

  // ==========================================
  // Create New Session
  // ==========================================

  const { accessToken, refreshToken: newRefreshToken } =
    await createSession({
      user,
      req,
      userType: session.userType,
    });

  // ==========================================
  // Revoke Old Session
  // ==========================================

  session.revoked = true;
  await session.save();

  // ==========================================
  // Return
  // ==========================================

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};