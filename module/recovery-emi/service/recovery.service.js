import RecoveryRepository from "../repository/recovery.repository.js";

import LoanApplication from "../../loan-applications/loanApplication.model.js";
import EMI from "../../loan-emi/loanEMI.model.js";
import Employee from "../../User/models.js";

import ApiError from "../../../Global/ApiError.js";
// import ApiError from "../../../Global/ApiError.js";
import ApiResponse from "../../../Global/ApiResponse.js";
import asyncHandler from "../../../Global/asyncHandler.js";
class RecoveryService {
  /**
   * Validate Recovery Case
   */
  async validateRecoveryCase(caseId, employeeId = null) {
    const recoveryCase = await RecoveryRepository.findById(caseId);

    if (!recoveryCase) {
      throw new ApiError(404, "Recovery case not found");
    }

    // Agent Authorization
    if (employeeId) {
      if (!recoveryCase.assignedAgent) {
        throw new ApiError(400, "Recovery case is not assigned");
      }

      if (recoveryCase.assignedAgent._id.toString() !== employeeId.toString()) {
        throw new ApiError(403, "You are not assigned to this recovery case");
      }
    }

    return recoveryCase;
  }

  /**
   * Get Recovery Queue
   */
  async getQueue(filters) {
    return RecoveryRepository.getQueue(filters);
  }

  /**
   * Get Recovery Case Details
   */
  async getRecoveryCase(caseId) {
    const recoveryCase = await RecoveryRepository.findById(caseId);

    if (!recoveryCase) {
      throw new ApiError(404, "Recovery case not found");
    }

    const activities = await RecoveryRepository.getActivities(caseId);

    return {
      recoveryCase,

      activities,
    };
  }

  /**
   * Assign Recovery Agent
   */
  async assignAgent({
    caseId,

    agentId,

    adminId,
  }) {
    const recoveryCase = await RecoveryRepository.findById(caseId);

    if (!recoveryCase) {
      throw new ApiError(404, "Recovery case not found");
    }

    if (recoveryCase.status === "IN_PROGRESS") {
      throw new ApiError(400, "Active recovery cannot be reassigned");
    }

    const agent = await Employee.findById(agentId);

    if (!agent) {
      throw new ApiError(404, "Collection agent not found");
    }

    if (agent.role !== "COLLECTION_AGENT") {
      throw new ApiError(400, "Employee is not collection agent");
    }

    const updatedCase = await RecoveryRepository.assignAgent(
      caseId,

      agentId,

      adminId,
    );

    await RecoveryRepository.createActivity({
      recoveryCase: caseId,

      actor: adminId,

      actorModel: "Admin",

      activityType: "CASE_ASSIGNED",

      remark: "Recovery case assigned to collection agent",
    });

    return updatedCase;
  }

  /**
   * Get My Assigned Cases
   */
  async getMyCases(employeeId) {
    return RecoveryRepository.getMyCases(employeeId);
  }

  /**
   * Start Recovery
   */
  async startRecovery({
    caseId,

    employeeId,
  }) {
    const recoveryCase = await this.validateRecoveryCase(caseId, employeeId);

    // Case already completed
    if (
      recoveryCase.status === "COMPLETED" ||
      recoveryCase.status === "CLOSED"
    ) {
      throw new ApiError(400, "Recovery case already closed");
    }

    // Already running
    if (recoveryCase.status === "IN_PROGRESS") {
      throw new ApiError(400, "Recovery already started");
    }

    // Update Case

    const updatedCase = await RecoveryRepository.startRecovery(caseId);

    // Timeline Activity

    await RecoveryRepository.createActivity({
      recoveryCase: caseId,

      actor: employeeId,

      actorModel: "Employee",

      activityType: "STARTED",

      remark: "Recovery process started by collection agent",
    });

    return updatedCase;
  }

  /**
   * Add Call Activity
   */
async addCallActivity({

  caseId,

  employeeId,

  remark,

  outcome,

  nextFollowupDate,

  promisedAmount,

  promisedDate,

}) {
    const recoveryCase = await this.validateRecoveryCase(caseId, employeeId);

    // Recovery active check

    if (recoveryCase.status !== "IN_PROGRESS") {
      throw new ApiError(400, "Recovery is not active");
    }

const activity = await RecoveryRepository.createActivity({

  recoveryCase: caseId,

  actor: employeeId,

  actorModel: "Employee",

  activityType: "CALL",

  remark,

  outcome,

  nextFollowupDate,


  // Promise Details
  promisedAmount,

  promisedDate,

});

    let updatePayload = {
      nextFollowupDate,
    };

    switch (outcome) {
    case "PROMISE":

updatePayload.stage = "PROMISE_TO_PAY";


updatePayload.promiseDetails = {

  amount: promisedAmount,

  promisedDate,

  createdAt: new Date(),

  status: "ACTIVE"

};


break;

      case "PARTIAL_PAYMENT":
        updatePayload.stage = "PARTIAL_PAYMENT";

        break;

      case "FULL_PAYMENT":
        updatePayload.stage = "SETTLED";

        break;

      case "FAILED":

      case "CUSTOMER_REFUSED":
        updatePayload.stage = "FAILED";

        break;

      case "NO_RESPONSE":

      case "NOT_AVAILABLE":
        updatePayload.stage = "CALLING";

        break;
    }

    const updatedCase = await RecoveryRepository.updateRecoveryCase(
      caseId,

      updatePayload,
    );

    return {
      recoveryCase: updatedCase,

      activity,
    };
  }

  /**
   * Create Recovery Case From EMI
   */
  async createRecoveryCaseFromEmi(emiId) {
    const existing = await RecoveryRepository.findByEmi(emiId);

    if (existing) {
      return existing;
    }

    const emi = await EMI.findById(emiId);

    if (!emi) {
      throw new ApiError(404, "EMI not found");
    }

    const loan = await LoanApplication.findById(emi.loan);

    if (!loan) {
      throw new ApiError(404, "Loan not found");
    }

    let priority = "LOW";

    if (emi.dpd >= 60) {
      priority = "CRITICAL";
    } else if (emi.dpd >= 30) {
      priority = "HIGH";
    }

    const recoveryCase = await RecoveryRepository.createRecoveryCase({
      recoveryId: `RC${Date.now()}`,

      loan: loan._id,

      emi: emi._id,

      customer: loan.customer,

      outstandingAmount: emi.outstandingAmount,

      penaltyAmount: emi.penaltyAmount || 0,

      dpd: emi.dpd || 0,

      priority,

      stage: "QUEUE",

      status: "OPEN",
    });

    await RecoveryRepository.createActivity({
      recoveryCase: recoveryCase._id,

      actor: null,

      actorModel: "System",

      activityType: "CASE_CREATED",

      remark: "Recovery case created automatically",
    });

    return recoveryCase;
  }

  /**
   * Close Recovery Case
   */
  async closeCase({
    caseId,

    userId,

    role,
  }) {
    const recoveryCase = await RecoveryRepository.findById(caseId);

    if (!recoveryCase) {
      throw new ApiError(404, "Recovery case not found");
    }

    if (recoveryCase.status === "CLOSED") {
      throw new ApiError(400, "Recovery case already closed");
    }

    const updated = await RecoveryRepository.closeCase(caseId);

    await RecoveryRepository.createActivity({
      recoveryCase: caseId,

      actor: userId,

      actorModel: role === "ADMIN" ? "Admin" : "Employee",

      activityType: "CLOSED",

      remark: "Recovery case closed",
    });

    return updated;
  }

  /**
 * Add Visit Activity
 */
async addVisitActivity({

  caseId,

  employeeId,

  remark,

  visitStatus,

  latitude,

  longitude,

  address,

  nextFollowupDate,

}) {

  const recoveryCase =
    await this.validateRecoveryCase(
      caseId,
      employeeId
    );

  if (recoveryCase.status !== "IN_PROGRESS") {
    throw new ApiError(
      400,
      "Recovery is not active"
    );
  }

  const activity =
    await RecoveryRepository.createActivity({

      recoveryCase: caseId,

      actor: employeeId,

      actorModel: "Employee",

      activityType: "VISIT",

      remark,

      visitStatus,

      location: {

        latitude,

        longitude,

        address,

      },

      nextFollowupDate,

    });

  const updatedCase =
    await RecoveryRepository.updateRecoveryCase(

      caseId,

      {

        stage: "FIELD_VISIT",

        nextFollowupDate,

      }

    );

  return {

    recoveryCase: updatedCase,

    activity,

  };

}

/**
 * Collect Payment
 */
async collectPayment({

  caseId,

  employeeId,

  amount,

  paymentMode,

  utrNumber,

  remark,

}) {

  const recoveryCase =
    await this.validateRecoveryCase(
      caseId,
      employeeId
    );

  if (recoveryCase.status !== "IN_PROGRESS") {
    throw new ApiError(
      400,
      "Recovery is not active"
    );
  }

  if (amount <= 0) {
    throw new ApiError(
      400,
      "Invalid payment amount"
    );
  }

  const existing =
    await RecoveryRepository.findPaymentByUTR(
      utrNumber
    );

  if (existing) {
    throw new ApiError(
      409,
      "Duplicate UTR number"
    );
  }

  const payment =
    await RecoveryRepository.createPayment({

      loan: recoveryCase.loan,

      emi: recoveryCase.emi,

      user: recoveryCase.customer,

      amount,

      paymentSource: paymentMode,

      utrNumber,

      paymentStatus: "SUCCESS",

    });

  const emi =
    await RecoveryRepository.updateEmi(

      recoveryCase.emi,

      {

        $inc: {

          outstandingAmount: -amount,

        },

      }

    );

  let stage = "PARTIAL_PAYMENT";

  if (emi.outstandingAmount <= 0) {
    stage = "SETTLED";
  }

  const updatedCase =
    await RecoveryRepository.updateRecoveryCase(

      caseId,

      {

        stage,

      }

    );

  await RecoveryRepository.createActivity({

    recoveryCase: caseId,

    actor: employeeId,

    actorModel: "Employee",

    activityType: "PAYMENT",

    remark,

    amount,

  });

  return {

    payment,

    recoveryCase: updatedCase,

    emi,

  };

}

/**
 * Add Remark
 */
async addRemark({

  caseId,

  employeeId,

  remark,

}) {

  await this.validateRecoveryCase(

    caseId,

    employeeId

  );

  const activity =
    await RecoveryRepository.createActivity({

      recoveryCase: caseId,

      actor: employeeId,

      actorModel: "Employee",

      activityType: "REMARK",

      remark,

    });

  return activity;

}


/**
 * Escalate Recovery Case
 */
async escalateCase({

  caseId,

  employeeId,

  reason,

  remark,

}) {

  const recoveryCase =
    await this.validateRecoveryCase(
      caseId,
      employeeId
    );

  if (
    recoveryCase.status === "CLOSED" ||
    recoveryCase.stage === "SETTLED"
  ) {
    throw new ApiError(
      400,
      "Recovery case already completed"
    );
  }

  const updatedCase =
    await RecoveryRepository.updateRecoveryCase(

      caseId,

      {

        stage: "ESCALATED",

        escalation: {

          reason,

          escalatedBy: employeeId,

          escalatedAt: new Date(),

        },

      }

    );

  await RecoveryRepository.createActivity({

    recoveryCase: caseId,

    actor: employeeId,

    actorModel: "Employee",

    activityType: "ESCALATED",

    remark,

  });

  return updatedCase;

}
/**
 * Dashboard
 */
async getEmployeeDashboard(employeeId) {

  return await RecoveryRepository.getEmployeeDashboard(employeeId);

}
/**
 * Agent Performance
 */
async getAgentPerformance() {

  return await RecoveryRepository.getAgentPerformance();

}
/**
 * Pending Followups
 */
async getPendingFollowups() {

  return await RecoveryRepository.getPendingFollowups();

}
/**
 * Promise To Pay Cases
 */
async getPromiseCases() {

  return await RecoveryRepository.getPromiseCases();

}
/**
 * Send Case To Legal
 */
async sendLegal({

  caseId,

  adminId,

  advocateName,

  advocateContact,

  noticeNumber,

  remark,

}) {

  const recoveryCase =
    await RecoveryRepository.findById(caseId);

  if (!recoveryCase) {
    throw new ApiError(
      404,
      "Recovery case not found"
    );
  }

  if (
    recoveryCase.stage === "LEGAL"
  ) {
    throw new ApiError(
      400,
      "Case already sent for legal action"
    );
  }

  const updatedCase =
    await RecoveryRepository.sendLegal(

      caseId,

      {

        advocateName,

        advocateContact,

        noticeNumber,

        initiatedBy: adminId,

        remark,

      }

    );

  await RecoveryRepository.createActivity({

    recoveryCase: caseId,

    actor: adminId,

    actorModel: "Admin",

    activityType: "LEGAL",

    remark:
      remark ||
      "Case forwarded to legal department",

  });

  return updatedCase;

}

}

export default new RecoveryService();
