import Disbursement from "./disbursement.model.js";
import { DISBURSEMENT_STATUS } from "./disbursement.constants.js";
import LoanApplication from "../loan-applications/loanApplication.model.js";
import { calculateEMI,generateSchedule} from "../loan-products/service/emi.service.js";

class DisbursementService {

  // =========================
  // CREATE DISBURSEMENT
  // =========================
  async createDisbursement(data) {
    const disbursement = await Disbursement.create({
      loanId: data.loanId,
      userId: data.userId,
      amount: data.amount,
      bankDetails: data.bankDetails,
      status: DISBURSEMENT_STATUS.PENDING_APPROVAL,
    });

    return disbursement;
  }

  // =========================
  // APPROVE DISBURSEMENT
  // =========================
  async approveDisbursement(id, adminId) {
    const disbursement = await Disbursement.findById(id);

    if (!disbursement) throw new Error("Disbursement not found");

    disbursement.status = DISBURSEMENT_STATUS.APPROVED;
    disbursement.approvedBy = adminId;
    disbursement.approvedAt = new Date();

    await disbursement.save();
    return disbursement;
  }

  // =========================
  // REJECT DISBURSEMENT
  // =========================
  async rejectDisbursement(id, adminId, remarks) {
    const disbursement = await Disbursement.findById(id);

    if (!disbursement) throw new Error("Disbursement not found");

    disbursement.status = DISBURSEMENT_STATUS.REJECTED;
    disbursement.approvedBy = adminId;
    disbursement.remarks = remarks;

    await disbursement.save();
    return disbursement;
  }

  // =========================
  // MARK COMPLETED (MAIN FLOW)
  // =========================
  async markCompleted(id, utrNumber) {
    const disbursement = await Disbursement.findById(id);

    if (!disbursement) throw new Error("Disbursement not found");

    // Prevent double processing (IMPORTANT FIX)
    if (disbursement.status === DISBURSEMENT_STATUS.COMPLETED) {
      throw new Error("Disbursement already completed");
    }

    // 1. Update disbursement
    disbursement.status = DISBURSEMENT_STATUS.COMPLETED;
    disbursement.utrNumber = utrNumber;
    disbursement.processedAt = new Date();

    await disbursement.save();

    // 2. Activate Loan
    const loan = await this.activateLoan(disbursement);

    return { disbursement, loan };
  }

  // =========================
  // LOAN ACTIVATION
  // =========================
async activateLoan(disbursement) {
  const loan = await LoanApplication.findById(disbursement.loanId);

  if (!loan) {
    throw new Error("Loan not found");
  }

  const emiAmount = calculateEMI({
    amount: disbursement.amount,
    tenure: loan.tenure,
    interestRate: loan.interestRate,
  });

  const totalPayable = emiAmount * loan.tenure;
  const totalInterest = totalPayable - disbursement.amount;

  loan.status = "ACTIVE";
  loan.stage = "ACTIVE";
  loan.disbursedAmount = disbursement.amount;
  loan.outstandingAmount = disbursement.amount;
  loan.disbursementStatus = "SUCCESS";

  loan.emiAmount = emiAmount;
  loan.totalPayable = totalPayable;
  loan.totalInterest = totalInterest;

  loan.emiSummary = {
    totalInstallments: loan.tenure,
    paidInstallments: 0,
    pendingInstallments: loan.tenure,
    overdueInstallments: 0,
    nextDueDate: null,
    nextEMIAmount: emiAmount,
  };

  await loan.save();

  // Generate EMI schedule
  await generateSchedule(loan);

  return loan;
}
  // =========================
  // GET ALL
  // =========================
  async getAll() {
    return await Disbursement.find()
      .populate("loanId")
      .populate("userId")
      .sort({ createdAt: -1 });
  }

  // =========================
  // GET BY ID
  // =========================
  async getById(id) {
    return await Disbursement.findById(id)
      .populate("loanId")
      .populate("userId");
  }
}

export default new DisbursementService();