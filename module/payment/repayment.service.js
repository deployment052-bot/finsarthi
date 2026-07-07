import Payment from "./payment.model.js";
import LoanEMI from "./../loan-emi/loanEMI.model.js"
import LoanApplication from "../loan-applications/loanApplication.model.js"


/**
 * Generate UPI Deep Link
 */
const generateUPILink = (payment) => {
  const upiId = "jhasiddharth495@okhdfcbank";
  const merchantName = "FinSarthi";

  return `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=${encodeURIComponent(
    merchantName
  )}&am=${payment.amount}&cu=INR&tn=${encodeURIComponent(
    payment.paymentId
  )}`;
};

/**
 * Submit Payment (Manual UTR Verification Flow)
 */
const submitPayment = async ({
  paymentId,
  utrNumber,
  customerRemark,
  userId,
}) => {

  const payment = await Payment.findOne({
    paymentId,
    user: userId,
  });

  // 1. Payment exist check
  if (!payment) {
    throw new Error("Payment not found.");
  }

  // 2. Already success check
  if (payment.status === "SUCCESS") {
    throw new Error("Payment already verified.");
  }

  // 3. Already under verification check
  if (payment.status === "UNDER_VERIFICATION") {
    throw new Error("Payment is already under verification.");
  }

  // ❌ REMOVED: expiry check (THIS WAS YOUR BUG)

  // 4. Duplicate UTR check
  if (utrNumber) {
    const duplicateUTR = await Payment.findOne({
      utrNumber,
      _id: { $ne: payment._id },
    });

    if (duplicateUTR) {
      throw new Error("This UTR has already been used.");
    }
  }

  // 5. Update payment
  payment.utrNumber = utrNumber;
  payment.customerRemark = customerRemark || "";
  payment.status = "UNDER_VERIFICATION";

  await payment.save();

  return payment;
};
const verifyRepayment = async ({
  paymentId,
  adminId,
  ipAddress,
  device,
}) => {

  // ----------------------------
  // Find Payment
  // ----------------------------
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new Error("Payment not found.");
  }

  if (payment.status === "SUCCESS") {
    throw new Error("Payment already verified.");
  }

  if (payment.status !== "UNDER_VERIFICATION") {
    throw new Error("Payment is not under verification.");
  }

  // ----------------------------
  // Find EMI
  // ----------------------------
  const emi = await LoanEMI.findById(payment.emi);

  if (!emi) {
    throw new Error("EMI not found.");
  }

  if (emi.status === "PAID") {
    throw new Error("EMI already paid.");
  }

  // ----------------------------
  // Find Loan
  // ----------------------------
  const loan = await LoanApplication.findById(payment.loan);

  if (!loan) {
    throw new Error("Loan not found.");
  }

  // ----------------------------
  // Mark Payment Success
  // ----------------------------
  payment.status = "SUCCESS";

  payment.receiptNumber = `RCPT-${Date.now()}`;

payment.verification = {
    verifiedBy: adminId,
    verifiedAt: new Date(),
    ipAddress,
    device,
    remark: "Verified successfully",
};

  await payment.save();

  // ----------------------------
  // Close EMI
  // ----------------------------
  emi.status = "PAID";

  emi.payment = payment._id;

  emi.paymentDate = new Date();

  emi.paidAmount = payment.amount;

  emi.penaltyStopped = true;

  emi.outstandingAmount = 0;

  emi.totalDueAmount = 0;

  await emi.save();

  // ----------------------------
  // Update Loan
  // ----------------------------
  loan.outstandingAmount = Math.max(
    0,
    loan.outstandingAmount - payment.amount
  );

  loan.emiSummary.paidInstallments += 1;

  loan.emiSummary.pendingInstallments = Math.max(
    0,
    loan.emiSummary.pendingInstallments - 1
  );

  // ----------------------------
  // Next EMI
  // ----------------------------
  const nextEMI = await LoanEMI.findOne({
    loan: loan._id,
    status: {
      $in: ["UPCOMING", "DUE", "OVERDUE", "PARTIAL"],
    },
  }).sort({
    installmentNumber: 1,
  });

  if (nextEMI) {
    loan.emiSummary.nextDueDate = nextEMI.dueDate;

    loan.emiSummary.nextEMIAmount =
      nextEMI.totalDueAmount > 0
        ? nextEMI.totalDueAmount
        : nextEMI.emiAmount + nextEMI.penaltyAmount;
  } else {
    loan.emiSummary.nextDueDate = null;

    loan.emiSummary.nextEMIAmount = 0;
  }

  // ----------------------------
  // Overdue Count
  // ----------------------------
  loan.emiSummary.overdueInstallments =
    await LoanEMI.countDocuments({
      loan: loan._id,
      status: "OVERDUE",
    });

  // ----------------------------
  // Loan Closed?
  // ----------------------------
  if (loan.outstandingAmount <= 0) {
    loan.status = "CLOSED";

    loan.stage = "CLOSED";
  }

  await loan.save();

  return {
    payment,
    emi,
    loan,
  };
};

const rejectRepayment = async (
  paymentId,
  adminId,
  remarks = ""
) => {

  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new Error("Payment not found.");
  }

  if (payment.status === "SUCCESS") {
    throw new Error("Verified payment cannot be rejected.");
  }

  payment.status = "REJECTED";

  payment.verification = {
    verifiedBy: adminId,
    verifiedAt: new Date(),
    remark: remarks || "Payment rejected",
  };

  await payment.save();

  return payment;
};

const getAll = async () => {

  return await Payment.find()
    .populate("user", "name email phone")
    .populate("loan")
    .populate("emi")
    .sort({ createdAt: -1 });

};


const getByUser = async (userId) => {

  return await Payment.find({
    user: userId,
  })
    .populate("loan")
    .populate("emi")
    .sort({ createdAt: -1 });

};


export default {
  generateUPILink,
  submitPayment,
  verifyRepayment,
  rejectRepayment,

  getAll,
  getByUser,
};