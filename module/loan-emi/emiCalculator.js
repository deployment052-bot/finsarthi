export const calculateEMISchedule = ({
  loanAmount,
  annualInterestRate,
  tenureMonths,
  startDate,
}) => {
  const monthlyRate = annualInterestRate / 12 / 100;

  // EMI Formula
  const emi =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  let balance = loanAmount;
  const schedule = [];

  for (let i = 1; i <= tenureMonths; i++) {
    const interest = balance * monthlyRate;
    const principal = emi - interest;
    balance -= principal;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      emiNumber: i,
      principalAmount: Math.round(principal),
      interestAmount: Math.round(interest),
      totalAmount: Math.round(emi),
      dueDate,
      remainingBalance: Math.max(0, Math.round(balance)),
    });
  }

  return schedule;
};