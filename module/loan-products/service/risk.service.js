export const getRiskData = async (user) => {
  let score = 700;

  if (user.kycVerified)
    score += 100;

  if (user.bankVerified)
    score += 100;

  if (user.mobileVerified)
    score += 50;

  if (user.previousLoanPaid)
    score += 150;

  if (user.cibilScore >= 750)
    score += 150;
  else if (user.cibilScore >= 700)
    score += 100;
  else if (user.cibilScore >= 650)
    score += 50;

  return {
    score,

    activeLoans: 0,

    overdueAmount: 0,

    enquiries: 0,

    source: "INTERNAL",
  };
};