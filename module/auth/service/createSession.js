import { v4 as uuid } from "uuid";

import RefreshToken from "../RefreshToken.js";

import { hashToken } from "../utils/hashToken.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

import { getDeviceInfo } from "../utils/deviceInfo.js";

export const createSession = async ({
  user,
  req,
  userType = "CUSTOMER",
}) => {
  // ==========================================
  // Device Information
  // ==========================================

  const device = getDeviceInfo(req);

  // ==========================================
  // Session Identifiers
  // ==========================================

  const familyId = uuid();
  const sessionId = uuid();
  const jti = uuid();

  // ==========================================
  // Generate Tokens
  // ==========================================

  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken({
    user,
    familyId,
    sessionId,
    jti,
  });

  // ==========================================
  // Refresh Token Expiry
  // ==========================================

  const refreshExpiresInDays = parseInt(
    process.env.REFRESH_TOKEN_DAYS || "30",
    10
  );

  const expiresAt = new Date(
    Date.now() + refreshExpiresInDays * 24 * 60 * 60 * 1000
  );

  // ==========================================
  // Save Session
  // ==========================================

  await RefreshToken.create({
    user: user._id,

    userType,

    tokenHash: hashToken(refreshToken),

    familyId,

    sessionId,

    jti,

    deviceId: device.deviceId || sessionId,

    deviceName: device.deviceName,

    browser: device.browser,

    platform: device.platform,

    ip: device.ip,

    userAgent: device.userAgent,

    lastUsedAt: new Date(),

    expiresAt,
  });

  // ==========================================
  // Return Tokens
  // ==========================================

  return {
    accessToken,
    refreshToken,
    sessionId,
    familyId,
  };
};