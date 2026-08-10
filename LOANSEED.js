import mongoose from "mongoose";
import dotenv from "dotenv";
import LoanProduct from "./module/loan-products/loanProduct.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedGoldLoan = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    // Check existing Gold Loan
    const existing = await LoanProduct.findOne({
      code: "GOLD-LOAN-001",
    });

    if (existing) {
      console.log(
        "Gold Loan already exists:",
        existing._id.toString()
      );

      return;
    }

    const goldLoan = await LoanProduct.create({
      // ==========================================
      // BASIC INFORMATION
      // ==========================================

      name: "Gold Loan",

      code: "GOLD-LOAN-001",

      description:
        "Gold loan against eligible gold jewellery, ornaments and coins. Final loan amount is determined after certified appraisal of gold purity and weight.",

      // ==========================================
      // CATEGORY
      // ==========================================

      category: "GOLD",

      // ==========================================
      // PROCESSING
      // ==========================================

      processingType: "MANUAL",

      // ==========================================
      // LOAN AMOUNT
      // ==========================================

      minAmount: 10000,

      maxAmount: 2500000,

      // ==========================================
      // TENURE
      // Months
      // ==========================================

      minTenure: 3,

      maxTenure: 36,

      // ==========================================
      // INTEREST
      // ==========================================

      // 0.75% per month = 9% p.a.
      // Starting rate mentioned in requirements.
      interestRate: 9,

      interestType: "REDUCING",

      // ==========================================
      // EMI
      // ==========================================

      emiFrequency: "MONTHLY",

      // ==========================================
      // CHARGES
      // ==========================================

      processingFee: 1,

      processingFeeType: "PERCENTAGE",

      gstPercentage: 18,

      // ==========================================
      // ELIGIBILITY
      // ==========================================

      minRiskScore: 700,

      maxActiveLoans: 2,

      // ==========================================
      // LOAN BEHAVIOUR
      // ==========================================

      instantDisbursement: false,

      requiresPhysicalVerification: true,

      // ==========================================
      // OVERDUE CONFIGURATION
      // ==========================================

      overdue: {
        enabled: true,
        type: "PERCENTAGE",
        value: 2,
        graceDays: 3,
        maxPenaltyPercentage: 100,
      },

      // ==========================================
      // DYNAMIC FRONTEND FORM CONFIGURATION
      // ==========================================

      formConfiguration: {
        fields: [
          // ========================================
          // STEP 1 - PERSONAL DETAILS
          // ========================================

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
            placeholder: "Enter Your Phone No.",
            section: "Personal Details",
          },

          {
            key: "email",
            label: "Email ID",
            type: "email",
            required: true,
            placeholder: "Enter Your Email Address",
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

          // ========================================
          // STEP 2 - EMPLOYMENT & INCOME
          // ========================================

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
            placeholder: "Enter Existing EMI amount",
            section: "Employment & Income",
          },

          {
            key: "occupationDetails",
            label: "Occupation Details",
            type: "text",
            required: true,
            placeholder: "e.g. Software engineer, Shop-owner",
            section: "Employment & Income",
          },

          // ========================================
          // STEP 3 - GOLD DETAILS
          // ========================================

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
            placeholder: "Enter weight in grams",
            section: "Gold Details",
          },

          {
            key: "goldPurity",
            label: "Purity (Carat)",
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
            placeholder: "Describe the gold item",
            example:
              "2 Bangles, 1 Necklace, 1 Ring",
            section: "Gold Details",
          },

          // ========================================
          // STEP 4 - LOAN REQUIREMENTS
          // ========================================

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
            key: "interestType",
            label: "Interest Type",
            type: "radio",
            required: true,
            options: [
              {
                value: "FLAT",
                label: "Fixed Interest",
                description:
                  "Interest rate remains constant",
              },
              {
                value: "REDUCING",
                label: "Reducing Balance",
                description:
                  "Interest calculated on outstanding",
              },
            ],
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
                description:
                  "Regular monthly payments",
              },
              {
                value: "BULLET_REPAYMENT",
                label: "Bullet Repayments",
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
            key: "interestRateInformation",
            label: "Interest Rate Information",
            type: "info",
            required: false,
            content:
              "Our competitive interest rates start from 0.75% per month. Final rate depends on loan amount, tenure, and your profile.",
            section: "Loan Requirements",
          },

          // ========================================
          // STEP 6 - VERIFY & SUBMIT
          // ========================================

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
              "I acknowledge the privacy policy and consent to the processing of my information.",
            type: "checkbox",
            required: true,
            section: "Terms & Consent",
          },
        ],

        // ========================================
        // DOCUMENTS
        // ========================================

        documents: [
          {
            code: "AADHAAR",
            label: "Aadhaar Card",
            required: true,
            allowedTypes: [
              "pdf",
              "jpg",
              "jpeg",
              "png",
            ],
            maxSizeMB: 10,
          },

          {
            code: "PAN",
            label: "PAN Card",
            required: true,
            allowedTypes: [
              "pdf",
              "jpg",
              "jpeg",
              "png",
            ],
            maxSizeMB: 10,
          },

          {
            code: "ADDRESS_PROOF",
            label: "Address Proof",
            required: true,
            allowedTypes: [
              "pdf",
              "jpg",
              "jpeg",
              "png",
            ],
            maxSizeMB: 10,
          },

          {
            code: "INCOME_PROOF",
            label: "Income Proof",
            required: true,
            description:
              "Salary Slip, Offer Letter, Bank Statement or ITR",
            acceptedExamples: [
              "Salary Slip",
              "Offer Letter",
              "Bank Statement",
              "ITR",
            ],
            allowedTypes: [
              "pdf",
              "jpg",
              "jpeg",
              "png",
            ],
            maxSizeMB: 10,
          },

          {
            code: "BANK_STATEMENT",
            label: "Bank Statement",
            required: true,
            period: "LAST_6_MONTHS",
            allowedTypes: [
              "pdf",
              "jpg",
              "jpeg",
              "png",
            ],
            maxSizeMB: 10,
          },
        ],
      },

      // ==========================================
      // STATUS
      // ==========================================

      active: true,
    });

    console.log(
      "Gold Loan created successfully:",
      goldLoan._id.toString()
    );

    console.log("Code:", goldLoan.code);
    console.log("Name:", goldLoan.name);
  } catch (error) {
    console.error("Gold Loan seed failed:", error);
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");
  }
};

seedGoldLoan();