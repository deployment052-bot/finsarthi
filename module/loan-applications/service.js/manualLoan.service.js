import LoanApplication from "../loanApplication.model.js";
import LoanProductDocument from "../../loan-products/LoanProductDocument.model.js";

export const applyManualLoan = async ({
  userId,
  product,
  amount,
  tenure,
  applicationData = {},
  documents = [],
  remarks = "",
}) => {
  // ---------------------------------------------
  // 1. Validate Loan Amount
  // ---------------------------------------------

  if (
    amount < product.minAmount ||
    amount > product.maxAmount
  ) {
    const error = new Error(
      `Loan amount must be between ${product.minAmount} and ${product.maxAmount}`
    );

    error.statusCode = 400;

    throw error;
  }

  // ---------------------------------------------
  // 2. Validate Tenure
  // ---------------------------------------------

  if (
    tenure < product.minTenure ||
    tenure > product.maxTenure
  ) {
    const error = new Error(
      `Loan tenure must be between ${product.minTenure} and ${product.maxTenure} months`
    );

    error.statusCode = 400;

    throw error;
  }

  // ---------------------------------------------
  // 3. Fetch Documents Assigned To Product
  // ---------------------------------------------

  const mappings = await LoanProductDocument.find({
    loanProduct: product._id,
  }).populate("document");

  // ---------------------------------------------
  // 4. Get Mandatory Documents
  // ---------------------------------------------

  const mandatoryDocs = mappings.filter(
    (item) => item.mandatory === true
  );

  // ---------------------------------------------
  // 5. Validate Mandatory Documents
  // ---------------------------------------------

  for (const doc of mandatoryDocs) {
    const uploaded = documents.find(
      (d) =>
        String(d.document) ===
        String(doc.document._id)
    );

    if (!uploaded || !uploaded.file) {
      const error = new Error(
        `${doc.document.name} is required`
      );

      error.statusCode = 400;

      throw error;
    }
  }

  // ---------------------------------------------
  // 6. Product Snapshot
  // ---------------------------------------------

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

  // ---------------------------------------------
  // 7. Prepare Documents
  // ---------------------------------------------

  const applicationDocuments = documents.map((doc) => ({
    document: doc.document,
    file: doc.file,
    verified: false,
    verifiedBy: null,
    verifiedAt: null,
    remarks: "",
  }));

  // ---------------------------------------------
  // 8. Create Loan Application
  // ---------------------------------------------

  const application = await LoanApplication.create({
    applicationId: `APP-${Date.now()}`,

    customer: userId,

    product: product._id,

    productSnapshot,

    amount,

    tenure,

    interestRate: product.interestRate,

    stage: "APPLICATION",

    status: "SUBMITTED",

    documents: applicationDocuments,

    applicationData,

    remarks,

    disbursementStatus: "PENDING",
  });

  // ---------------------------------------------
  // 9. Return Application
  // ---------------------------------------------

  return application;
};