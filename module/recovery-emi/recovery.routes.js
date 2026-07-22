import express from "express";

import {
  getQueue,
  getMyCases,
  getRecoveryCase,
  assignAgent,
  closeCase,
  startRecovery,
  addCallActivity,
  addVisitActivity,
  collectPayment,
  addRemark,
  escalateCase,
  getDashboard,
  getAgentPerformance,
  getPendingFollowups,
  getPromiseCases,
  sendLegal,
  getDashboardemp,
} from "./controller/recovery.controller.js";

import { protect } from "../../middleware/authMiddleware.js";
// import authorize from "../../middleware/roleMiddleware.js";

const router = express.Router();

/* ===========================================================
   ADMIN ROUTES
=========================================================== */
/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test API
 *     responses:
 *       200:
 *         description: OK
 */
/**
 * GET /recovery/queue
 * Recovery Queue
 */
router.get(
  "/queue",
  protect,
  // authorize("ADMIN"),
  getQueue,
);

/**
 * GET /recovery/dashboard
 * Dashboard
 */
router.get(
  "/dashboard",
  protect,
  // authorize("ADMIN"),
  getDashboard,
);

router.get(
  "/dashboardemp",
  protect,
  // authorize("COLLECTION_AGENT"),
  getDashboardemp
);

/**
 * GET /recovery/agent-performance
 * Agent Performance
 */
router.get(
  "/agent-performance",
  protect,
  // authorize("ADMIN"),
  getAgentPerformance,
);

/**
 * GET /recovery/promises
 * Promise To Pay Cases
 */
router.get(
  "/promises",
  protect,
  // authorize("ADMIN"),
  getPromiseCases,
);

/**
 * POST /recovery/:caseId/assign
 * Assign Collection Agent
 */
router.post(
  "/:caseId/assign",
  protect,
  // authorize("ADMIN"),
  assignAgent,
);

/**
 * PUT /recovery/:caseId/close
 * Close Recovery Case
 */
router.put(
  "/:caseId/close",
  protect,
  // authorize("ADMIN"),
  closeCase,
);

/**
 * PUT /recovery/:caseId/legal
 * Send Case To Legal
 */
router.put(
  "/:caseId/legal",
  protect,
  // authorize("ADMIN"),
  sendLegal,
);

/* ===========================================================
   COLLECTION AGENT / EMPLOYEE ROUTES
=========================================================== */

/**
 * GET /recovery/my-cases
 */
router.get(
  "/my-cases",
  protect,
  // authorize("COLLECTION_AGENT"),
  getMyCases,
);

/**
 * PUT /recovery/:caseId/start
 */
router.put(
  "/:caseId/start",
  protect,
  // authorize("COLLECTION_AGENT"),
  startRecovery,
);

/**
 * POST /recovery/:caseId/call
 */
router.post(
  "/:caseId/call",
  protect,
  // authorize("COLLECTION_AGENT"),
  addCallActivity,
);

/**
 * POST /recovery/:caseId/visit
 */
router.post(
  "/:caseId/visit",
  protect,
  // authorize("COLLECTION_AGENT"),
  addVisitActivity,
);

/**
 * POST /recovery/:caseId/payment
 */
router.post(
  "/:caseId/payment",
  protect,
  // authorize("COLLECTION_AGENT"),
  collectPayment,
);

/**
 * POST /recovery/:caseId/remark
 */
router.post(
  "/:caseId/remark",
  protect,
  // authorize("COLLECTION_AGENT"),
  addRemark,
);

/**
 * PUT /recovery/:caseId/escalate
 */
router.put(
  "/:caseId/escalate",
  protect,
  // authorize("COLLECTION_AGENT"),
  escalateCase,
);

/**
 * GET /recovery/followups
 */
router.get(
  "/followups",
  protect,
  // authorize("COLLECTION_AGENT"),
  getPendingFollowups,
);

/* ===========================================================
   COMMON ROUTES
=========================================================== */

/**
 * GET /recovery/:caseId
 * Recovery Case Details
 */
router.get(
  "/:caseId",
  protect,
  // authorize("ADMIN", "COLLECTION_AGENT"),
  getRecoveryCase,
);

export default router;
