import LoanEMI from "../../loan-emi/loanEMI.model.js";

// ===============================
// EMI CALCULATOR
// ===============================
export const calculateEMI = ({
  amount,
  tenure,
  interestRate,
}) => {
  const monthlyRate = interestRate / 12 / 100;

  // Interest Free Loan
  if (monthlyRate === 0) {
    return Math.round(amount / tenure);
  }

  const emi =
    (amount *
      monthlyRate *
      Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1);

  return Math.round(emi);
};

// ===============================
// EMI SCHEDULE GENERATION
// ===============================
export const generateSchedule = async (loan) => {
  // Delete old schedule if exists
  await LoanEMI.deleteMany({
    loan: loan._id,
  });

  const monthlyRate = loan.interestRate / 12 / 100;

  let outstanding = loan.disbursedAmount;

  const emiAmount = calculateEMI({
    amount: loan.disbursedAmount,
    tenure: loan.tenure,
    interestRate: loan.interestRate,
  });

  const emis = [];

  for (let i = 1; i <= loan.tenure; i++) {
    const interest = Math.round(outstanding * monthlyRate);

    let principal = emiAmount - interest;

    if (i === loan.tenure) {
      principal = outstanding;
    }

    outstanding = Math.max(0, outstanding - principal);

    // Due Date
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);

    emis.push({
      loan: loan._id,

      emiId: `EMI-${loan.applicationId}-${i}`,

      installmentNumber: i,

      dueDate,

      // --------------------
      // EMI DETAILS
      // --------------------
      emiAmount,

      principalAmount: principal,

      interestAmount: interest,

      outstandingAmount: outstanding,

      // --------------------
      // PAYMENT DETAILS
      // --------------------
      paidAmount: 0,

      paymentDate: null,

      payment: null,

      // --------------------
      // OVERDUE DETAILS
      // --------------------
      penaltyAmount: 0,

      overdueDays: 0,

      totalDueAmount: emiAmount,

      lastPenaltyCalculatedAt: null,

      penaltyStopped: false,

      // --------------------
      // STATUS
      // --------------------
      status: i === 1 ? "DUE" : "UPCOMING",

      isClosed: false,

      remarks: "",
    });
  }

  await LoanEMI.insertMany(emis);

  return emis;
};