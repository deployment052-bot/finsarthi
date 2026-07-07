import express from "express";
import {
  createDisbursement,
  approveDisbursement,
  rejectDisbursement,
  markCompleted,
  getAll,
  getById,
} from "./disbursement.controller.js";

import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createDisbursement);
router.get("/", protect, getAll);
router.get("/:id", protect, getById);

router.put("/:id/approve", protect, approveDisbursement);
router.put("/:id/reject", protect, rejectDisbursement);
router.put("/:id/complete", protect, markCompleted);

export default router;