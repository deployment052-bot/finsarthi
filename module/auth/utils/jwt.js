import jwt from "jsonwebtoken";

/**
 * Generate Access Token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role || "CUSTOMER",
      tokenVersion: user.tokenVersion || 0,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
      issuer: "finsarthi",
      audience: "finsarthi-app",
    }
  );
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = ({
  user,
  familyId,
  sessionId,
  jti,
}) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      tokenVersion: user.tokenVersion || 0,

      familyId,
      sessionId,
      jti,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "30d",
      issuer: "finsarthi",
      audience: "finsarthi-app",
    }
  );
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: "finsarthi",
    audience: "finsarthi-app",
  });
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: "finsarthi",
    audience: "finsarthi-app",
  });
};