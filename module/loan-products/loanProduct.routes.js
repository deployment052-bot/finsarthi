import express from "express";

import {
  createLoanProduct,
  getLoanProducts,
  getLoanProductById,
  updateLoanProduct,
  deleteLoanProduct,
  toggleLoanProductStatus,

  // Document APIs
  createDocument,
updateDocument,
getDocuments,
  // Mapping APIs
  assignDocumentsToLoanProduct,
  getAssignedDocuments,
} from "./loanProduct.controller.js";
import { protect} from "../../middleware/authMiddleware.js"
const router = express.Router();

/* ============================
   Loan Product APIs
============================ */

router.post("/create/loan",protect, createLoanProduct);

router.get("/get", getLoanProducts);

router.get("/:id/product", getLoanProductById);

router.put("/:id", updateLoanProduct);

router.delete("/:id", deleteLoanProduct);

router.patch("/:id/toggle-status", toggleLoanProductStatus);

/* ============================
   Document Master APIs
============================ */

router.post("/documents",protect, createDocument);

/* Later Add */

 router.get("/documents", getDocuments);

/// router.get("/documents/:id", getDocumentById);

router.put("/documents/:id",protect, updateDocument);

//  router.delete("/documents/:id", deleteDocument);

/* ============================
   Loan Product Document Mapping
============================ */

router.post("/:id/documents",protect, assignDocumentsToLoanProduct);

router.get("/:id/documents",protect, getAssignedDocuments);

// Later

// router.patch("/:id/documents/:mappingId", updateAssignedDocument);

// router.delete("/:id/documents/:mappingId", removeAssignedDocument);

export default router;
