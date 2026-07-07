import express from "express";
import {
  saveKyc,
  getMyKyc,
  submitKyc,
} from "./kyc.controller.js";

import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/v1/kyc", protect, saveKyc);

router.get("/me", protect, getMyKyc);

router.post("/submit", protect, submitKyc);

export default router;