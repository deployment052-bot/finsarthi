
import express from "express";
import {protect} from "../../middleware/authMiddleware.js";

import {
  getPreferences,
  updatePreferences,
  enableAllNotifications,
  disableAllNotifications,
} from "./notificationPreference.controller.js";

const router = express.Router();

/**
 * GET Preferences
 */
router.get(
  "/",
  protect,
  getPreferences
);

/**
 * Update Single/Multiple Preferences
 */
router.patch(
  "/",
  protect,
  updatePreferences
);

/**
 * Enable All
 */
router.patch(
  "/enable-all",
  protect,
  enableAllNotifications
);

/**
 * Disable All
 */
router.patch(
  "/disable-all",
  protect,
  disableAllNotifications
);

export default router;

