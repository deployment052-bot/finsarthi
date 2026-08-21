import mongoose from "mongoose";
import dotenv from "dotenv";

import LoanProduct from "./module/loan-products/loanProduct.model.js";
import DocumentMaster from "./module/loan-products/documentMaster.model.js";
import LoanProductDocument from "./module/loan-products/LoanProductDocument.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedPersonalLoan002 = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    // =========================================================
    // 1. CREATE / FIND NEW PERSONAL LOAN
    // =========================================================

    let personalLoan = await LoanProduct.findOne({
      code: "PERSONAL-LOAN-002",
    });

    if (personalLoan) {
      console.log(
        "Personal Loan already exists:",
        personalLoan._id.toString()
      );
    } else {
      personalLoan = await LoanProduct.create({
        name: "Personal Loan",
        code: "PERSONAL-LOAN-002",

        description:
          "Unsecured personal loan for eligible salaried and self-employed customers with employment-based document requirements.",

        category: "PERSONAL",

        processingType: "MANUAL",

        minAmount: 25000,
        maxAmount: 500000,

        minTenure: 6,
        maxTenure: 60,

        interestRate: 12.5,
        interestType: "REDUCING",

        emiFrequency: "MONTHLY",

        processingFee: 2,
        processingFeeType: "PERCENTAGE",
        gstPercentage: 18,

        minRiskScore: 650,
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

        // =====================================================
        // FORM CONFIGURATION
        // =====================================================

        formConfiguration: {
          fields: [
            // =================================================
            // PERSONAL DETAILS
            // =================================================

            {
              key: "fullName",
              label: "Full Name",
              type: "text",
              required: true,
              placeholder: "Enter your full name",
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
              key: "mobileNumber",
              label: "Mobile Number",
              type: "phone",
              required: true,
              placeholder: "Enter your mobile number",
              section: "Personal Details",
            },

            {
              key: "dateOfBirth",
              label: "Date of Birth",
              type: "date",
              required: true,
              placeholder: "DD/MM/YYYY",
              section: "Personal Details",
            },

            // =================================================
            // EMPLOYMENT & INCOME
            // =================================================

            {
              key: "employmentType",
              label: "What best describes you?",
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
              ],

              section: "Employment & Income",
            },

            {
              key: "companyName",
              label: "Company / Business Name",
              type: "text",
              required: true,
              placeholder: "Enter company or business name",
              section: "Employment & Income",
            },

            {
              key: "monthlyIncome",
              label: "Monthly Income",
              type: "number",
              required: true,
              min: 0,
              placeholder: "Enter your monthly income",
              section: "Employment & Income",
            },

            {
              key: "existingEmi",
              label: "Existing EMI",
              type: "number",
              required: false,
              min: 0,
              placeholder: "Enter existing EMI amount",
              section: "Employment & Income",
            },

            {
              key: "employmentExperience",
              label: "Work Experience",
              type: "number",
              required: false,
              min: 0,
              placeholder: "Enter experience in years",
              section: "Employment & Income",
            },

            // =================================================
            // LOAN REQUIREMENTS
            // =================================================

            {
              key: "loanAmount",
              label: "Loan Amount Required",
              type: "number",
              required: true,
              min: 25000,
              max: 500000,
              placeholder: "Enter loan amount",
              section: "Loan Requirements",
            },

            {
              key: "loanTenure",
              label: "Loan Tenure",
              type: "select",
              required: true,

              options: [
                {
                  value: "6",
                  label: "6 months",
                },
                {
                  value: "12",
                  label: "12 months",
                },
                {
                  value: "18",
                  label: "18 months",
                },
                {
                  value: "24",
                  label: "24 months",
                },
                {
                  value: "36",
                  label: "36 months",
                },
                {
                  value: "48",
                  label: "48 months",
                },
                {
                  value: "60",
                  label: "60 months",
                },
              ],

              section: "Loan Requirements",
            },

            {
              key: "loanPurpose",
              label: "Loan Purpose",
              type: "select",
              required: true,

              options: [
                {
                  value: "MEDICAL",
                  label: "Medical Expenses",
                },
                {
                  value: "EDUCATION",
                  label: "Education",
                },
                {
                  value: "WEDDING",
                  label: "Wedding",
                },
                {
                  value: "TRAVEL",
                  label: "Travel",
                },
                {
                  value: "HOME_RENOVATION",
                  label: "Home Renovation",
                },
                {
                  value: "DEBT_CONSOLIDATION",
                  label: "Debt Consolidation",
                },
                {
                  value: "EMERGENCY",
                  label: "Emergency",
                },
                {
                  value: "OTHER",
                  label: "Other",
                },
              ],

              section: "Loan Requirements",
            },

            {
              key: "preferredEmi",
              label: "Preferred EMI",
              type: "number",
              required: false,
              min: 0,
              placeholder: "Enter preferred EMI",
              section: "Loan Requirements",
            },

            // =================================================
            // ADDRESS DETAILS
            // =================================================

            {
              key: "address",
              label: "Current Address",
              type: "textarea",
              required: true,
              placeholder: "Enter your current address",
              section: "Address Details",
            },

            {
              key: "city",
              label: "City",
              type: "text",
              required: true,
              placeholder: "Enter city",
              section: "Address Details",
            },

            {
              key: "state",
              label: "State",
              type: "text",
              required: true,
              placeholder: "Enter state",
              section: "Address Details",
            },

            {
              key: "pincode",
              label: "PIN Code",
              type: "number",
              required: true,
              placeholder: "Enter PIN code",
              section: "Address Details",
            },

            // =================================================
            // TERMS & CONSENT
            // =================================================

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

          // =====================================================
          // CONDITIONAL DOCUMENT CONFIGURATION
          // =====================================================

          documents: {
            SALARIED: [
              {
                code: "SALARY_SLIP",
                label: "Salary Slip",
                required: true,
              },

              {
                code: "BANK_STATEMENT",
                label: "Bank Statement",
                required: true,
              },
            ],

            SELF_EMPLOYED: [
              {
                code: "FORM_16",
                label: "Form 16",
                required: true,
              },

              {
                code: "COMPANY_ID",
                label: "Company ID",
                required: true,
              },

              {
                code: "OFFER_LETTER",
                label: "Offer Letter",
                required: true,
              },

              {
                code: "BANK_STATEMENT",
                label: "Bank Statement",
                required: true,
              },

              {
                code: "ADDRESS_PROOF",
                label: "Address Proof",
                required: true,
              },
            ],
          },
        },

        active: true,
      });

      console.log(
        "NEW Personal Loan created:",
        personalLoan._id.toString()
      );
    }

    // =========================================================
    // 2. ALL REQUIRED DOCUMENT CODES
    // =========================================================

    const documentCodes = [
      "SALARY_SLIP",
      "BANK_STATEMENT",
      "FORM_16",
      "COMPANY_ID",
      "OFFER_LETTER",
      "ADDRESS_PROOF",
    ];

    // =========================================================
    // 3. GET DOCUMENT MASTER RECORDS
    // =========================================================

    const documents = await DocumentMaster.find({
      code: { $in: documentCodes },
      active: true,
    });

    const foundCodes = documents.map(
      (doc) => doc.code
    );

    const missingCodes = documentCodes.filter(
      (code) => !foundCodes.includes(code)
    );

    if (missingCodes.length > 0) {
      throw new Error(
        `Missing DocumentMaster records: ${missingCodes.join(", ")}`
      );
    }

    console.log(
      "All required DocumentMaster records found:",
      documents.length
    );

    // =========================================================
    // 4. DELETE EXISTING MAPPINGS FOR THIS NEW LOAN
    // =========================================================

    await LoanProductDocument.deleteMany({
      loanProduct: personalLoan._id,
    });

    console.log(
      "Old document mappings removed for PERSONAL-LOAN-002"
    );

    // =========================================================
    // 5. CREATE DOCUMENT MAPPINGS
    //
    // NOTE:
    // All six documents are linked to the loan product.
    // Employment type decides which documents frontend should
    // actually ask from the customer.
    // =========================================================

    const mappings = documentCodes.map(
      (code, index) => {
        const document = documents.find(
          (doc) => doc.code === code
        );

        return {
          loanProduct: personalLoan._id,
          document: document._id,

          mandatory: false,

          displayOrder: index + 1,

          active: true,
        };
      }
    );

    const createdMappings =
      await LoanProductDocument.insertMany(
        mappings
      );

    console.log(
      "Document mappings created:",
      createdMappings.length
    );

    // =========================================================
    // 6. FINAL OUTPUT
    // =========================================================

    console.log("\n======================================");
    console.log("NEW PERSONAL LOAN CREATED");
    console.log("======================================");

    console.log(
      "Loan ID:",
      personalLoan._id.toString()
    );

    console.log(
      "Loan Code:",
      personalLoan.code
    );

    console.log(
      "Loan Name:",
      personalLoan.name
    );

    // =========================================================
    // SALARIED DOCUMENTS
    // =========================================================

    console.log("\n======================================");
    console.log("SALARIED EMPLOYEE DOCUMENTS");
    console.log("======================================");

    console.log("1. Salary Slip");
    console.log("2. Bank Statement");

    // =========================================================
    // SELF EMPLOYED DOCUMENTS
    // =========================================================

    console.log("\n======================================");
    console.log("SELF EMPLOYED DOCUMENTS");
    console.log("======================================");

    console.log("1. Form 16");
    console.log("2. Company ID");
    console.log("3. Offer Letter");
    console.log("4. Bank Statement");
    console.log("5. Address Proof");

    // =========================================================
    // MAPPINGS
    // =========================================================

    console.log("\n======================================");
    console.log("DOCUMENT MASTER MAPPINGS");
    console.log("======================================");

    for (const mapping of createdMappings) {
      const document = documents.find(
        (doc) =>
          doc._id.toString() ===
          mapping.document.toString()
      );

      console.log(
        `${mapping.displayOrder}. ${document.name} |`,
        `DocumentMaster ID: ${document._id} |`,
        `Mapping ID: ${mapping._id}`
      );
    }

    console.log("\nSeed completed successfully.");
  } catch (error) {
    console.error(
      "Personal Loan seed failed:",
      error
    );
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");
  }
};

seedPersonalLoan002();