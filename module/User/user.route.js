import express from "express";
import { getProfile,getVerificationStatus,getKycProgress} from "./controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/v1/profile", protect, getProfile);
router.get('/v1/get-verification',protect,getVerificationStatus)

router.get(
  "/v1/get-kyc",
  (req, res, next) => {
    console.log("🔥🔥 GET-KYC ROUTE HIT");
    next();
  },
  protect,
  getKycProgress
);


export default router;