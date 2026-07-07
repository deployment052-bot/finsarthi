import { calculateEMI } from "./emi.service.js";
import { getAvailableEMICapacity } from "./affordability.service.js";

export const decideLoan = ({
  score = 0,
  amount = 0,
  tenure = 0,
  interestRate = 0,
  approvedLimit = 0,
  monthlyIncome = 0,
  existingEMI = 0,
}) => {
  // Income validation
  if (!monthlyIncome || monthlyIncome <= 0) {
    return {
      approved: false,
      reason: "INCOME_REQUIRED",
    };
  }

  // Limit validation
  if (amount > approvedLimit) {
    return {
      approved: false,
      reason: "LIMIT_EXCEEDED",
    };
  }

  // EMI Calculation
  const emi = calculateEMI({
    amount,
    tenure,
    interestRate,
  });

  // Affordability Check
  const availableEMI = getAvailableEMICapacity(
    monthlyIncome,
    existingEMI
  );

  if (emi > availableEMI) {
    return {
      approved: false,
      reason: "EMI_CAPACITY_EXCEEDED",
      emi,
      availableEMI,
    };
  }

  // Instant Approval
  if (score >= 850) {
    return {
      approved: true,
      status: "APPROVED",
      type: "INSTANT",
      emi,
    };
  }

  // Manual Review
  if (score >= 700) {
    return {
      approved: true,
      status: "UNDER_REVIEW",
      type: "MANUAL",
      emi,
    };
  }

  // Reject
  return {
    approved: false,
    status: "REJECTED",
    reason: "LOW_SCORE",
  };
};