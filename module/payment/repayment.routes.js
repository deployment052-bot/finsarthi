import express from "express";
import {
  createPaymentIntent,
  verifyRepayment,
  rejectRepayment,
  getAllRepayments,
  getUserRepayments,
  submitPayment
} from "./repayment.controller.js";

import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Customer
router.post("/create-payment", protect, createPaymentIntent);
router.get("/my", protect, getUserRepayments);

// Admin/Accounts
router.put('/submit',protect,submitPayment)
router.get("/", protect, getAllRepayments);
router.put("/:id/verify", protect, verifyRepayment);
router.put("/:id/reject", protect, rejectRepayment);

export default router;