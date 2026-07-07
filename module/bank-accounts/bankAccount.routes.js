

import express from "express";

import {
  createBankAccount,
  getMyBankAccount,getBankDetails
} from "./bank.controller.js";

import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add-bank", protect, createBankAccount);

router.get("/me", protect, getMyBankAccount);

router.get('/v1/get-verification',protect,getBankDetails)

export default router;