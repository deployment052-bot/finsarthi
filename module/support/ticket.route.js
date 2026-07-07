import express from "express";
import {
  createTicket,
  getUserTickets,
  getAllTickets,
} from "./ticket.controller.js";

import { protect } from "../../middleware/authMiddleware.js";
import { upload } from "../../middleware/upload_Ticket.js"; // 👈 ADD THIS

const router = express.Router();

/**
 * USER ROUTES
 */

// Create ticket WITH IMAGE UPLOAD
router.post(
  "/tickets",
  protect,
  upload.array("attachments", 5), // 👈 THIS IS IMAGE HANDLER
  createTicket
);

// Get user tickets
router.get("/tickets", protect, getUserTickets);

/**
 * ADMIN ROUTES
 */

router.get("/admin/tickets", protect, getAllTickets);

export default router;