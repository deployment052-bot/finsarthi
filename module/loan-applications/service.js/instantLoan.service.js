// loan-application/service/instantLoan.service.js

import LoanApplication from "../loanApplication.model.js";
import { checkEligibility } from "../../loan-products/service/eligibility.service.js";
import { decideLoan } from "../../loan-products/service/decision.service.js";

export const applyInstantLoan = async (req, res, product) => {
  try {
    const { amount, tenure } = req.body;

    // Eligibility Check
    const eligibility = await checkEligibility(req.user);

    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: eligibility.reason,
      });
    }

    if (amount > eligibility.approvedLimit) {
      return res.status(400).json({
        success: false,
        message: "Requested amount exceeds approved limit.",
        approvedLimit: eligibility.approvedLimit,
      });
    }

    // Decision Engine
    const decision = decideLoan({
      score: eligibility.riskScore,
      amount,
      tenure,
      interestRate: product.interestRate,
      approvedLimit: eligibility.approvedLimit,
      monthlyIncome: eligibility.monthlyIncome,
      existingEMI: 0,
    });

    if (!decision.approved) {
      return res.status(400).json({
        success: false,
        message: decision.reason,
      });
    }

    // Create Loan Application
    const application = await LoanApplication.create({
      applicationId: `APP-${Date.now()}`,
      customer: req.user._id,
      product: product._id,
      amount,
      approvedAmount: 0,
      disbursedAmount: 0,
      outstandingAmount: 0,
      interestRate: product.interestRate,
      tenure,
      emiAmount: decision.emi,
      totalInterest: decision.totalInterest || 0,
      totalPayable: decision.totalPayable || 0,
      status:
        decision.type === "INSTANT"
          ? "APPROVED"
          : "UNDER_REVIEW",

      riskSnapshot: {
        score: eligibility.riskScore,
        grade: decision.grade,
        approvedLimit: eligibility.approvedLimit,
        engineVersion: "v1",
      },

      creditSnapshot: eligibility.creditData,
    });

    return res.status(201).json({
      success: true,
      message: "Loan applied successfully.",
      data: application,
    });
  } catch (error) {
    console.error("Instant Loan Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};