import LoanApplication from "../../loan-applications/loanApplication.model.js";
import KYC from "../../kyc/kyc.model.js";
import BankAccount from "../../bank-accounts/BankAccount.model.js";

import { getRiskData } from "./risk.service.js";
import { calculateLimit } from "./limit.service.js";

export const checkEligibility = async (user) => {

  const kyc = await KYC.findOne({
    user: user._id,
    status: "VERIFIED",
  });

  if (!kyc) {
    return {
      eligible: false,
      reason: "KYC_REQUIRED",
    };
  }

  const bank = await BankAccount.findOne({
    user: user._id,
    status: "VERIFIED",
  });

  if (!bank) {
    return {
      eligible: false,
      reason: "BANK_REQUIRED",
    };
  }

  if (!kyc.monthlyIncome) {
    return {
      eligible: false,
      reason: "INCOME_REQUIRED",
    };
  }

  const activeLoans =
    await LoanApplication.countDocuments({
      customer: user._id,
      status: {
        $in: [
          "APPROVED",
          "ACTIVE",
          "DISBURSED",
        ],
      },
    });

  if (activeLoans >= 100) {
    return {
      eligible: false,
      reason: "MAX_ACTIVE_LOANS",
    };
  }

  const creditData =
    await getRiskData(user, kyc);

  const approvedLimit =
    calculateLimit(
      creditData.score,
      kyc.monthlyIncome
    );

return {
  eligible: true,

  riskScore:
    creditData.score,

  approvedLimit,

  monthlyIncome:
    kyc.monthlyIncome,

  creditData,
};
};