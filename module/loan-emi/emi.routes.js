import express from "express";
import {
  generateEMIs,
  getEMIsByLoan,
  payEMI,
} from "./emi.controller.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate/:loanId", protect, generateEMIs);
router.get("/:loanId", protect, getEMIsByLoan);
router.put("/pay/:emiId", protect, payEMI);

export default router;