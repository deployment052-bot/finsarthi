import mongoose from "mongoose";
import dotenv from "dotenv";

import LoanProduct from "./module/loan-products/loanProduct.model.js";
import DocumentMaster from "./module/loan-products/documentMaster.model.js";
import LoanProductDocument from "./module/loan-products/LoanProductDocument.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedGoldLoan = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    // =========================================================
    // 1. CREATE GOLD LOAN
    // =========================================================

    let goldLoan = await LoanProduct.findOne({
      code: "GOLD-LOAN-002",
    });

    if (goldLoan) {
      console.log(
        "Gold Loan already exists:",
        goldLoan._id.toString()
      );
    } else {
      goldLoan = await LoanProduct.create({
        name: "Gold Loan",
        code: "GOLD-LOAN-002",

        description:
          "Gold loan against eligible gold jewellery, ornaments and coins. Final loan amount is determined after physical verification and gold appraisal.",

        category: "GOLD",

        processingType: "MANUAL",

        minAmount: 10000,
        maxAmount: 2500000,

        minTenure: 3,
        maxTenure: 36,

        interestRate: 9,
        interestType: "REDUCING",

        emiFrequency: "MONTHLY",

        processingFee: 1,
        processingFeeType: "PERCENTAGE",
        gstPercentage: 18,

        minRiskScore: 700,
        maxActiveLoans: 2,

        instantDisbursement: false,
        requiresPhysicalVerification: true,

        overdue: {
          enabled: true,
          type: "PERCENTAGE",
          value: 2,
          graceDays: 3,
          maxPenaltyPercentage: 100,
        },

        formConfiguration: {
          fields: [
            {
              key: "fullName",
              label: "Full Name",
              type: "text",
              required: true,
              placeholder: "As per PAN card",
              section: "Personal Details",
            },

            {
              key: "mobileNumber",
              label: "Mobile Number",
              type: "phone",
              required: true,
              placeholder: "Enter your phone number",
              section: "Personal Details",
            },

            {
              key: "email",
              label: "Email ID",
              type: "email",
              required: true,
              placeholder: "Enter your email address",
              section: "Personal Details",
            },

            {
              key: "aadhaarNumber",
              label: "Aadhaar Number",
              type: "text",
              required: true,
              placeholder: "XXXX XXXX XXXX",
              section: "Personal Details",
            },

            {
              key: "employmentType",
              label: "Employment Type",
              type: "select",
              required: true,
              options: [
                {
                  value: "SALARIED",
                  label: "Salaried",
                },
                {
                  value: "SELF_EMPLOYED",
                  label: "Self Employed",
                },
                {
                  value: "BUSINESS",
                  label: "Business",
                },
                {
                  value: "PROFESSIONAL",
                  label: "Professional",
                },
                {
                  value: "OTHER",
                  label: "Other",
                },
              ],
              section: "Employment & Income",
            },

            {
              key: "monthlyIncome",
              label: "Monthly Income (₹)",
              type: "number",
              required: true,
              min: 0,
              placeholder: "Enter monthly income",
              section: "Employment & Income",
            },

            {
              key: "existingEmi",
              label: "Existing EMI (₹)",
              type: "number",
              required: true,
              min: 0,
              placeholder: "Enter existing EMI",
              section: "Employment & Income",
            },

            {
              key: "occupationDetails",
              label: "Occupation Details",
              type: "text",
              required: true,
              placeholder: "e.g. Software Engineer, Shop Owner",
              section: "Employment & Income",
            },

            // =====================================================
            // GOLD DETAILS
            // =====================================================

            {
              key: "goldType",
              label: "Gold Type",
              type: "select",
              required: true,
              options: [
                {
                  value: "GOLD_JEWELLERY",
                  label: "Gold Jewellery",
                },
                {
                  value: "GOLD_ORNAMENT",
                  label: "Gold Ornament",
                },
                {
                  value: "GOLD_COINS",
                  label: "Gold Coins",
                },
                {
                  value: "OTHER",
                  label: "Other",
                },
              ],
              section: "Gold Details",
            },

            {
              key: "goldWeight",
              label: "Gold Weight (grams)",
              type: "number",
              required: true,
              min: 0,
              placeholder: "Enter gold weight",
              section: "Gold Details",
            },

            {
              key: "goldPurity",
              label: "Gold Purity",
              type: "select",
              required: true,
              options: [
                {
                  value: "18K",
                  label: "18K",
                },
                {
                  value: "20K",
                  label: "20K",
                },
                {
                  value: "22K",
                  label: "22K",
                },
                {
                  value: "24K",
                  label: "24K",
                },
              ],
              section: "Gold Details",
            },

            {
              key: "ornamentDescription",
              label: "Ornament Description",
              type: "textarea",
              required: true,
              placeholder: "Describe the gold items",
              section: "Gold Details",
            },

            // =====================================================
            // LOAN REQUIREMENTS
            // =====================================================

            {
              key: "loanAmount",
              label: "Loan Amount (₹)",
              type: "number",
              required: true,
              min: 10000,
              max: 2500000,
              placeholder: "Enter required loan amount",
              section: "Loan Requirements",
            },

            {
              key: "repaymentMethod",
              label: "Repayment Method",
              type: "radio",
              required: true,
              options: [
                {
                  value: "MONTHLY_EMI",
                  label: "Monthly EMI",
                  description: "Regular monthly payments",
                },
                {
                  value: "BULLET_REPAYMENT",
                  label: "Bullet Repayment",
                  description:
                    "Principal repayment at maturity",
                },
                {
                  value: "INTEREST_ONLY",
                  label: "Interest Only",
                  description:
                    "Monthly interest + principal at end",
                },
              ],
              section: "Loan Requirements",
            },

            {
              key: "termsAccepted",
              label:
                "I have read and accept the terms and conditions.",
              type: "checkbox",
              required: true,
              section: "Terms & Consent",
            },

            {
              key: "privacyConsent",
              label:
                "I acknowledge the privacy policy and consent to processing of my information.",
              type: "checkbox",
              required: true,
              section: "Terms & Consent",
            },
          ],

          // IMPORTANT:
          // These are only frontend/document configuration references.
          // Actual DB relationship is created below using LoanProductDocument.

          documents: [
            {
              code: "AADHAAR",
              label: "Aadhaar Card",
              required: true,
            },
            {
              code: "PAN",
              label: "PAN Card",
              required: true,
            },
            {
              code: "ADDRESS_PROOF",
              label: "Address Proof",
              required: true,
            },
            {
              code: "INCOME_PROOF",
              label: "Income Proof",
              required: true,
            },
            {
              code: "BANK_STATEMENT",
              label: "Bank Statement",
              required: true,
            },
          ],
        },

        active: true,
      });

      console.log(
        "Gold Loan created:",
        goldLoan._id.toString()
      );
    }

    // =========================================================
    // 2. GET DOCUMENT MASTER IDS
    // =========================================================

    const documentCodes = [
      "AADHAAR",
      "PAN",
      "ADDRESS_PROOF",
      "INCOME_PROOF",
      "BANK_STATEMENT",
    ];

    const documents = await DocumentMaster.find({
      code: { $in: documentCodes },
      active: true,
    });

    if (documents.length !== documentCodes.length) {
      const foundCodes = documents.map((doc) => doc.code);

      const missing = documentCodes.filter(
        (code) => !foundCodes.includes(code)
      );

      throw new Error(
        `Missing DocumentMaster records: ${missing.join(", ")}`
      );
    }

    console.log(
      "Required DocumentMaster records found:",
      documents.length
    );

    // =========================================================
    // 3. DELETE OLD GOLD LOAN DOCUMENT MAPPINGS
    // =========================================================

    await LoanProductDocument.deleteMany({
      loanProduct: goldLoan._id,
    });

    console.log("Old Gold Loan document mappings removed");

    // =========================================================
    // 4. CREATE DOCUMENT MAPPINGS
    // =========================================================

    const mappings = documentCodes.map((code, index) => {
      const document = documents.find(
        (doc) => doc.code === code
      );

      return {
        loanProduct: goldLoan._id,
        document: document._id,
        mandatory: true,
        displayOrder: index + 1,
        active: true,
      };
    });

    const createdMappings =
      await LoanProductDocument.insertMany(mappings);

    console.log(
      "Gold Loan document mappings created:",
      createdMappings.length
    );

    // =========================================================
    // 5. FINAL OUTPUT
    // =========================================================

    console.log("\n======================================");
    console.log("GOLD LOAN CREATED SUCCESSFULLY");
    console.log("======================================");

    console.log("Loan ID:", goldLoan._id.toString());
    console.log("Loan Code:", goldLoan.code);
    console.log("Loan Name:", goldLoan.name);

    console.log("\nDocuments:");

    for (const mapping of createdMappings) {
      const document = documents.find(
        (doc) =>
          doc._id.toString() ===
          mapping.document.toString()
      );

      console.log(
        `${mapping.displayOrder}. ${document.name} |`,
        `DocumentMaster ID: ${document._id}`,
        `| Mapping ID: ${mapping._id}`
      );
    }

    console.log("\nSeed completed successfully.");
  } catch (error) {
    console.error("Gold Loan seed failed:", error);
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");
  }
};

seedGoldLoan();