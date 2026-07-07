export const getInternalCreditData = async (
  user
) => {

  let score = 700;

  if(user.kycVerified)
    score += 100;

  if(user.bankVerified)
    score += 100;

  if(user.mobileVerified)
    score += 50;

  score += user.totalRepaidLoans * 50;

  score -= user.defaultedLoans * 200;

  return {
    score,
    activeLoans: user.activeLoans,
    overdueAmount: 0,
    enquiries: 0,
    source: "INTERNAL"
  };
};