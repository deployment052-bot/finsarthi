import LoanApplication from "../loanApplication.model.js";
import LoanProduct from "../../loan-products/loanProduct.model.js";
import LoanEMI from "../../loan-emi/loanEMI.model.js";
import Disbursement from "../../loan-disbursement/disbursement.model.js";
import { generateLoanStatementPDF } from "../utils/recieptPdf.js";
import { checkEligibility } from "../../loan-products/service/eligibility.service.js";
import { decideLoan } from "../../loan-products/service/decision.service.js";
import BankAccount from "../../bank-accounts/BankAccount.model.js";
import { applyManualLoan } from "../service.js/manualLoan.service.js";
import { applyInstantLoan } from "../service.js/instantLoan.service.js";
import notificationService from "../../notification/service/notification.service.js";


import {uploadToCloudinary} 
from "../service.js/visitorVerification.service.js";
const maskAccountNumber = (accountNumber = "") => {
  if (!accountNumber) return "";

  return accountNumber.replace(/\d(?=\d{4})/g, "X");
};

export const applyLoan = async (req, res) => {
  try {
    console.log("========================================");
    console.log("🔥 APPLY LOAN API HIT");
    console.log("🔥 Request Body:", req.body);
    console.log("🔥 Amount Received:", req.body.amount);
    console.log("🔥 Tenure Received:", req.body.tenure);
    console.log("🔥 Product ID Received:", req.body.productId);
    console.log("========================================");

    const { productId, amount, tenure, purpose } = req.body;

    // Basic request validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Loan amount is required",
      });
    }

    if (!tenure) {
      return res.status(400).json({
        success: false,
        message: "Loan tenure is required",
      });
    }

    console.log("🔍 Searching Loan Product:", productId);

    const product = await LoanProduct.findById(productId);

    if (!product) {
      console.log("❌ Loan product not found:", productId);

      return res.status(404).json({
        success: false,
        message: "Loan product not found",
      });
    }

    console.log("========================================");
    console.log("✅ PRODUCT FOUND");
    console.log("Product ID:", product._id);
    console.log("Product Name:", product.name);
    console.log("Product Code:", product.code);
    console.log("Loan Type:", product.loanType);
    console.log("Processing Type:", product.processingType);
    console.log("Minimum Amount:", product.minAmount);
    console.log("Maximum Amount:", product.maxAmount);
    console.log("Interest Rate:", product.interestRate);
    console.log("========================================");

    // Snapshot prepare
    const productSnapshot = {
      productId: product._id,
      code: product.code,
      name: product.name,
      loanType: product.loanType,
      processingType: product.processingType,
      segment: product.segment,
      displayName: product.displayName,
    };

    console.log("📦 Product Snapshot:", productSnapshot);

    // Attach snapshot
    product.productSnapshot = productSnapshot;

    console.log("========================================");
    console.log("💰 LOAN REQUEST DETAILS");
    console.log("Requested Amount:", amount);
    console.log("Requested Tenure:", tenure);
    console.log("Purpose:", purpose);
    console.log("Product Min Amount:", product.minAmount);
    console.log("Product Max Amount:", product.maxAmount);
    console.log("Processing Type:", product.processingType);
    console.log("========================================");

    // Manual Loan
    if (product.processingType === "MANUAL") {
      console.log("🟡 MANUAL LOAN FLOW STARTED");

      return applyManualLoan(req, res, product);
    }

    // Instant Loan
    console.log("🟢 INSTANT LOAN FLOW STARTED");

    return applyInstantLoan(req, res, product);

  } catch (error) {
    console.error("========================================");
    console.error("❌ APPLY LOAN ERROR");
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    console.error("========================================");

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadLoanDocument = async (req, res) => {
    const { documentId } = req.body;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "File is required"
        });
    }

    const result = await uploadToCloudinary(req.file.path);

    return res.json({
        success: true,
        data: {
            documentId,
            file: result.secure_url,
            publicId: result.public_id
        }
    });
};

export const getLoan = async (req, res) => {
  try {
    const loans = await LoanApplication.find({
      customer: req.user._id,
      isDeleted: false,
    })
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      loans.map(async (loan) => {
        const nextEMI = await LoanEMI.findOne({
          loan: loan._id,
          status: {
            $in: ["UPCOMING", "DUE", "OVERDUE", "PARTIAL"],
          },
        }).sort({ installmentNumber: 1 });

        const totalEMIs = await LoanEMI.countDocuments({
          loan: loan._id,
        });

        const paidEMIs = await LoanEMI.countDocuments({
          loan: loan._id,
          status: "PAID",
        });

        return {
          loanId: loan._id,
          applicationId: loan.applicationId,
          loanNumber: loan.loanNumber,

          productName: loan.product?.name,

          approvedAmount: loan.approvedAmount,
          disbursedAmount: loan.disbursedAmount,
          outstandingAmount: loan.outstandingAmount,

          emiAmount: loan.emiAmount,

          tenure: loan.tenure,

          interestRate: loan.interestRate,

          status: loan.status,

          totalInstallments: totalEMIs,

          paidInstallments: paidEMIs,

          pendingInstallments: totalEMIs - paidEMIs,

          nextEMI: nextEMI
            ? {
                emiId: nextEMI.emiId,
                installmentNumber: nextEMI.installmentNumber,
                dueDate: nextEMI.dueDate,
                emiAmount: nextEMI.emiAmount,
                penaltyAmount: nextEMI.penaltyAmount,
                totalDueAmount: nextEMI.totalDueAmount,
                status: nextEMI.status,
              }
            : null,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLoanById = async (req, res) => {
  try {
    const { loanId } = req.params;

    // Loan
    const loan = await LoanApplication.findOne({
      _id: loanId,
      customer: req.user._id,
      isDeleted: false,
    })
      .populate("product", "name")
      .lean();

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found.",
      });
    }

    const bankAccount = await bankAccount.findOne({});

    // Disbursement Details
    const disbursement = await Disbursement.findOne({
      loanId: loan._id,
    }).lean();

    // EMI Schedule
    const emis = await LoanEMI.find({
      loan: loanId,
    })
      .sort({ installmentNumber: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        // Loan Info
        loanId: loan._id,
        applicationId: loan.applicationId,
        loanNumber: loan.loanNumber,

        productName: loan.product?.name,

        approvedAmount: loan.approvedAmount,
        disbursedAmount: loan.disbursedAmount,
        outstandingAmount: loan.outstandingAmount,

        interestRate: loan.interestRate,
        tenure: loan.tenure,
        emiAmount: loan.emiAmount,

        status: loan.status,

        // Bank Transfer Details
        bankDetails: disbursement
          ? {
              accountHolderName: disbursement.bankDetails?.accountHolderName,

              accountNumber: disbursement.bankDetails?.accountNumber,

              ifsc: disbursement.bankDetails?.ifsc,

              utrNumber: disbursement.utrNumber,

              transferredAmount: disbursement.amount,

              transferMethod: disbursement.method,

              transferStatus: disbursement.status,

              transferredAt: disbursement.processedAt,
            }
          : null,

        // EMI Schedule
        repaymentSchedule: emis.map((emi) => ({
          emiId: emi.emiId,

          installmentNumber: emi.installmentNumber,

          dueDate: emi.dueDate,

          emiAmount: emi.emiAmount,

          principalAmount: emi.principalAmount,

          interestAmount: emi.interestAmount,

          penaltyAmount: emi.penaltyAmount,

          totalDueAmount:
            emi.totalDueAmount || emi.emiAmount + emi.penaltyAmount,

          overdueDays: emi.overdueDays,

          status: emi.status,

          isClosed: emi.isClosed,
        })),
      },
    });
  } catch (error) {
    console.error("Get Loan Details Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const downloadLoanStatement = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await LoanApplication.findOne({
      _id: loanId,
      customer: req.user._id,
      isDeleted: false,
    })
      .populate("product")
      .lean();

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    const bank = await BankAccount.findOne({
      user: req.user._id,
      isPrimary: true,
    }).lean();

    const disbursement = await Disbursement.findOne({
      loanId,
    }).lean();

    const emis = await LoanEMI.find({
      loan: loanId,
    })
      .sort({ installmentNumber: 1 })
      .lean();

    // PDF Utility ko res bhi pass karo
    await generateLoanStatementPDF(
      {
        loanNumber: loan.loanNumber,

        borrower: {
          name: req.user.name,
          customerId: req.user.customerId,
          mobile: req.user.mobile,
          email: req.user.email,
          address: req.user.address,
        },

        productName: loan.product?.name,

        loanAmount: loan.approvedAmount,

        interestRate: loan.interestRate,

        tenure: loan.tenure,

        emiAmount: loan.emiAmount,

        totalInterest: loan.totalInterest,

        totalPayable: loan.totalPayable,

        loanStartDate: disbursement?.processedAt,

        loanEndDate: emis.at(-1)?.dueDate,

        nextEMIDate: emis.find((e) => e.status !== "PAID")?.dueDate,

        status: loan.status,

        bank,

        disbursement,

        repaymentSchedule: emis,

        summary: {
          totalInstallments: emis.length,

          paidInstallments: emis.filter((x) => x.status === "PAID").length,

          pendingInstallments: emis.filter(
            (x) => x.status === "DUE" || x.status === "UPCOMING",
          ).length,

          overdueInstallments: emis.filter((x) => x.status === "OVERDUE")
            .length,

          totalAmountPaid: emis.reduce((a, b) => a + (b.paidAmount || 0), 0),

          remainingAmount: loan.outstandingAmount,

          outstandingPrincipal: loan.outstandingAmount,

          outstandingInterest: loan.totalInterest,

          collectionPercentage:
            (emis.filter((x) => x.status === "PAID").length / emis.length) *
            100,
        },
      },
      res,
    );
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


