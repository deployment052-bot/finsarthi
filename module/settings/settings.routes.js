import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getSettings,
  updateSettings
} from "./settings.controller.js";

const router = express.Router();

router.get("/bio-metric", protect, getSettings);
router.patch("/add-bio", protect, updateSettings);

export default router;