import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getSettings,
  updateSettings
} from "./settings.controller.js";

const router = express.Router();

router.get("/", protect, getSettings);
router.patch("/", protect, updateSettings);

export default router;