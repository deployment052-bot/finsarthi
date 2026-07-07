export const calculateLimit = (
  riskScore,
  monthlyIncome
) => {

  let riskLimit = 0;

  if (riskScore >= 1000)
    riskLimit = 200000;

  else if (riskScore >= 900)
    riskLimit = 100000;

  else if (riskScore >= 850)
    riskLimit = 50000;

  else if (riskScore >= 800)
    riskLimit = 30000;

  else if (riskScore >= 750)
    riskLimit = 5000;

  else
    riskLimit = 500;

  const incomeLimit =
    monthlyIncome * 5;

  return Math.min(
    riskLimit,
    incomeLimit
  );
};