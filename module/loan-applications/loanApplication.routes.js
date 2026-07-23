import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { upload   } from "../../middleware/visitorupload.js";

import {
  applyLoan,
  getLoan,
  getLoanById,
  downloadLoanStatement,
} from "./controller/loanApplication.controller.js";

import {
  createApproval,
  approveLoan,
  rejectLoan,
  updateApproval,
  cancelApproval,
  getPendingApprovals,
  getApprovedLoans,
  getRejectedLoans,
  assignVisitor,
  getAllVisitors,
  getVisitorActivity,
  submitVerification,
  saveInvestigation,
  uploadPhoto,
  saveWitness,
  getVerificationDetails,
  getMyApplications,
  getApplicationProgress,getVisitorDashboard,getVerificationReview
} from "./controller/loanApproval.controller.js";

const router = express.Router();


// ======================================================
// LOAN APPLICATION
// ======================================================

router.post("/apply", protect, applyLoan);

router.get("/my-loans", protect, getLoan);

router.get("/:loanId/statement", protect, downloadLoanStatement);


// ======================================================
// LOAN APPROVAL
// ======================================================

router.post("/approval", protect, createApproval);

router.patch("/:loanId/approve", protect, approveLoan);

router.patch("/:loanId/reject", protect, rejectLoan);

router.patch("/:loanId", protect, updateApproval);

router.patch("/:loanId/cancel", protect, cancelApproval);


// ======================================================
// APPROVAL LISTS
// ======================================================

router.get("/approval/pending", protect, getPendingApprovals);

router.get("/approval/approved", protect, getApprovedLoans);

router.get("/approval/rejected", protect, getRejectedLoans);


// ======================================================
// VISITOR MANAGEMENT
// ======================================================

router.get("/visitors", protect, getAllVisitors);

router.post("/:loanId/assign-visitor", protect, assignVisitor);

router.get("/visitor/activity", protect, getVisitorActivity);


// ======================================================
// VISITOR VERIFICATION
// ======================================================

router.patch(
  "/:loanId/investigation",
  protect,
  saveInvestigation
);

router.post(
  "/:loanId/upload-photo",
  protect,
  upload.single("photo"),
  uploadPhoto
);

router.patch(
  "/:loanId/witness",
  protect,
  upload.fields([
    { name: "signature", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
    { name: "idDocument", maxCount: 1 },
  ]),
  saveWitness
);

router.patch(
  "/:loanId/submit-verification",
  protect,
  submitVerification
);


// ======================================================
// ADMIN VERIFICATION
// ======================================================

router.get(
  "/:loanId/verification",
  protect,
  getVerificationDetails
);


// ======================================================
// LOAN DETAILS
// ======================================================

router.get("/:loanId/check", protect, getLoanById);
router.get(
  "/my-applications",
  protect,
 
  getMyApplications
);


// Single application ka progress + checklist
router.get(
  "/my-applications/:loanId",
  protect,
 
  getApplicationProgress
);




router.get(
  "/dashboard",
protect,
  getVisitorDashboard
);


router.get(
  "/applications/:loanId/review",
  protect,
  getVerificationReview
);

// router.post('/get-summery',protect,)


export default router;