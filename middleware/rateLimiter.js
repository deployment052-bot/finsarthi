import rateLimit from "express-rate-limit";

// =======================================================
// COMMON HANDLER
// =======================================================

const rateLimitHandler = (req, res) => {
  return res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
  });
};

// =======================================================
// LOGIN
// 5 Requests / 15 Minutes
// =======================================================

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// =======================================================
// SEND OTP
// 3 Requests / 15 Minutes
// =======================================================

export const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// =======================================================
// VERIFY OTP
// 5 Requests / 10 Minutes
// =======================================================

export const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// =======================================================
// FORGOT PASSWORD
// 3 Requests / 15 Minutes
// =======================================================

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// =======================================================
// REGISTER
// 5 Requests / Hour
// =======================================================

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// =======================================================
// REFRESH TOKEN
// 20 Requests / 15 Minutes
// =======================================================

export const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// =======================================================
// GENERAL PUBLIC API
// 100 Requests / 15 Minutes
// =======================================================

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});