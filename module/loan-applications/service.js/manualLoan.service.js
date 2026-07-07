import LoanApplication from "../loanApplication.model.js";
import LoanProductDocument from "../../loan-products/LoanProductDocument.model.js";

export const applyManualLoan = async (req, res, product) => {
  try {
    const {
      amount,
      tenure,
      purpose,
      documents = [],
    } = req.body;

    // Fetch assigned documents for this loan product
    const mappings = await LoanProductDocument.find({
      loanProduct: product._id,
    }).populate("document");

    // Get mandatory documents
    const mandatoryDocs = mappings.filter(
      (item) => item.mandatory
    );

    // Validate uploaded documents
    for (const doc of mandatoryDocs) {
      const uploaded = documents.find(
        (d) =>
          d.documentId === doc.document._id.toString()
      );

      if (!uploaded) {
        return res.status(400).json({
          success: false,
          message: `${doc.document.name} is required`,
        });
      }
    }

    // Product Snapshot
    const productSnapshot = {
      productId: product._id,
      code: product.code,
      name: product.name,
      loanType: product.loanType,
      processingType: product.processingType,
      segment: product.segment,
      displayName: product.displayName,
      version: product.version || 1,
    };

    // Create Loan Application
    const application = await LoanApplication.create({
      applicationId: `APP-${Date.now()}`,

      customer: req.user._id,

      product: product._id,

      productSnapshot,

      amount,

      tenure,

      interestRate: product.interestRate,

      purpose,

      status: "UNDER_REVIEW",

      documents: documents.map((doc) => ({
        document: doc.documentId,
        file: doc.file,
        verified: false,
      })),
    });

    return res.status(201).json({
      success: true,
      message:
        "Loan application submitted successfully. Waiting for admin verification.",
      data: application,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};