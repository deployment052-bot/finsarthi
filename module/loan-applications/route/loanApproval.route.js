import express from "express";
import {
  createApproval,
  approveLoan,
  rejectLoan,
  updateApproval,
  cancelApproval,
  getApproval,
  getPendingApprovals,
  getApprovedLoans,
  getRejectedLoans,
} from "../controller/loanApproval.controller.js";

import { protect } from "../../auth/middleware/authMiddleware.js";

const router = express.Router();

/**
 * =========================
 * CREATE APPROVAL
 * =========================
 * POST /loan-approval
 */
router.post("/", protect, createApproval);

/**
 * =========================
 * APPROVE LOAN
 * =========================
 * PATCH /loan-approval/:loanId/approve
 */
router.patch("/:loanId/approve", protect, approveLoan);

/**
 * =========================
 * REJECT LOAN
 * =========================
 * PATCH /loan-approval/:loanId/reject
 */
router.patch("/:loanId/reject", protect, rejectLoan);

/**
 * =========================
 * UPDATE APPROVAL
 * =========================
 * PATCH /loan-approval/:loanId
 */
router.patch("/:loanId", protect, updateApproval);

/**
 * =========================
 * CANCEL APPROVAL
 * =========================
 * PATCH /loan-approval/:loanId/cancel
 */
router.patch("/:loanId/cancel", protect, cancelApproval);

/**
 * =========================
 * GET SINGLE APPROVAL
 * =========================
 * GET /loan-approval/:loanId
 */
router.get("/:loanId", protect, getApproval);

/**
 * =========================
 * GET PENDING APPROVALS
 * =========================
 * GET /loan-approval/pending
 */
router.get("/pending", protect, getPendingApprovals);

/**
 * =========================
 * GET APPROVED LOANS
 * =========================
 * GET /loan-approval/approved
 */
router.get("/approved", protect, getApprovedLoans);

/**
 * =========================
 * GET REJECTED LOANS
 * =========================
 * GET /loan-approval/rejected
 */
router.get("/rejected", protect, getRejectedLoans);

export default router;