import asyncHandler from "../../../Global/asyncHandler.js";
import ApiResponse from "../../../Global/ApiResponse.js";

import recoveryService from "../service/recovery.service.js";

/**
 * GET /recovery/queue
 */
export const getQueue = asyncHandler(async (req, res) => {
  const result = await recoveryService.getQueue(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Recovery queue fetched successfully"));
});

/**
 * GET /recovery/my-cases
 */
export const getMyCases = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;

  const result = await recoveryService.getMyCases(employeeId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Assigned recovery cases fetched successfully",
      ),
    );
});

/**
 * GET /recovery/:caseId
 */
export const getRecoveryCase = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  const result = await recoveryService.getRecoveryCase(caseId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Recovery case fetched successfully"));
});

/**
 * POST /recovery/:caseId/assign
 */
export const assignAgent = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  const { agentId } = req.body;

  const adminId = req.user._id;

  const result = await recoveryService.assignAgent({
    caseId,

    agentId,

    adminId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Recovery case assigned successfully"));
});

/**
 * PUT /recovery/:caseId/close
 */
export const closeCase = asyncHandler(async (req, res) => {
  const { caseId } = req.params;

  const result = await recoveryService.closeCase({
    caseId,

    userId: req.user._id,

    role: req.role,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Recovery case closed successfully"));
});









/**
 * PUT /recovery/:caseId/start
 */
export const startRecovery = asyncHandler(async (req, res) => {

  const { caseId } = req.params;

  const employeeId = req.user._id;

  const result = await recoveryService.startRecovery({
    caseId,
    employeeId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Recovery started successfully"
    )
  );

});



/**
 * POST /recovery/:caseId/call
 */
export const addCallActivity = asyncHandler(async (req, res) => {

  const { caseId } = req.params;

  const employeeId = req.user._id;

  const result = await recoveryService.addCallActivity({

    caseId,

    employeeId,

    ...req.body,

  });

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Call activity added successfully"
    )
  );

});


/**
 * POST /recovery/:caseId/visit
 */
export const addVisitActivity = asyncHandler(async (req, res) => {

  const { caseId } = req.params;

  const employeeId = req.user._id;

  const result = await recoveryService.addVisitActivity({

    caseId,

    employeeId,

    ...req.body,

  });

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Visit activity added successfully"
    )
  );

});


/**
 * POST /recovery/:caseId/payment
 */
export const collectPayment = asyncHandler(async (req, res) => {

  const { caseId } = req.params;

  const employeeId = req.user._id;

  const result =
    await recoveryService.collectPayment({

      caseId,

      employeeId,

      ...req.body,

    });

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Payment collected successfully"
    )
  );

});


/**
 * POST /recovery/:caseId/remark
 */
export const addRemark = asyncHandler(async (req, res) => {

  const { caseId } = req.params;

  const employeeId = req.user._id;

  const result =
    await recoveryService.addRemark({

      caseId,

      employeeId,

      ...req.body,

    });

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Remark added successfully"
    )
  );

});

/**
 * PUT /recovery/:caseId/escalate
 */
export const escalateCase = asyncHandler(async (req, res) => {

  const { caseId } = req.params;

  const employeeId = req.user._id;

  const result =
    await recoveryService.escalateCase({

      caseId,

      employeeId,

      ...req.body,

    });

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Recovery case escalated successfully"
    )
  );

});

/**
 * GET /recovery/dashboard
 */
export const getDashboard = asyncHandler(async (req, res) => {

  const result =
    await recoveryService.getDashboard();

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Recovery dashboard fetched successfully"
    )
  );

});

/**
 * GET /recovery/agent-performance
 */
export const getAgentPerformance = asyncHandler(async (req, res) => {

  const result =
    await recoveryService.getAgentPerformance();

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Agent performance fetched successfully"
    )
  );

});

/**
 * GET /recovery/followups
 */
export const getPendingFollowups = asyncHandler(async (req, res) => {

  const result =
    await recoveryService.getPendingFollowups();

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Pending followups fetched successfully"
    )
  );

});

/**
 * GET /recovery/promises
 */
export const getPromiseCases = asyncHandler(async (req, res) => {

  const result =
    await recoveryService.getPromiseCases();

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Promise to pay cases fetched successfully"
    )
  );

});

/**
 * PUT /recovery/:caseId/legal
 */
export const sendLegal = asyncHandler(async (req, res) => {

  const { caseId } = req.params;

  const adminId = req.user._id;

  const result =
    await recoveryService.sendLegal({

      caseId,

      adminId,

      ...req.body,

    });

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Case sent for legal action successfully"
    )
  );

});

/**
 * @swagger
 * /recovery/dashboard:
 *   get:
 *     summary: Get Recovery Dashboard
 *     description: Returns dashboard details for logged in recovery agent.
 *     tags:
 *       - Recovery
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recovery dashboard fetched successfully
 */
export const getDashboardemp = asyncHandler(async (req, res) => {

  const employeeId = req.user._id;

  console.log("Logged Employee:", employeeId);

  const result = await recoveryService.getEmployeeDashboard(employeeId);

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Recovery dashboard fetched successfully"
    )
  );

});




export const createPromise = async (req, res) => {
  try {
    const { caseId } = req.params;

    const {
      promiseAmount,
      promiseDate,
      remarks = "",
    } = req.body;

    // ============================
    // Validation
    // ============================
    if (!promiseAmount || promiseAmount <= 0) {
      throw new ApiError(400, "Valid promise amount is required");
    }

    if (!promiseDate) {
      throw new ApiError(400, "Promise date is required");
    }

    // ============================
    // Find Recovery Case
    // ============================
    const recoveryCase = await RecoveryCase.findById(caseId)
      .populate("customer");

    if (!recoveryCase) {
      throw new ApiError(404, "Recovery case not found");
    }

    // ============================
    // Update Promise Details
    // ============================
    recoveryCase.stage = "PROMISE_TO_PAY";

    recoveryCase.promiseDetails = {
      amount: promiseAmount,
      promisedDate: promiseDate,
      status: "ACTIVE",
      createdAt: new Date(),
    };

    await recoveryCase.save();

    // ============================
    // Customer Notification
    // ============================
    if (recoveryCase.customer) {
      await notificationService.send({
        user: recoveryCase.customer._id,
        phone: `91${recoveryCase.customer.mobile}`,
        title: "Promise To Pay Registered",
        message: `🏦 *FinSarthi*

Dear *${recoveryCase.customer.fullName}*,

Your Promise To Pay has been registered successfully.

💰 Amount : ₹${promiseAmount}
📅 Promise Date : ${new Date(promiseDate).toLocaleDateString("en-IN")}

Please ensure payment is made on or before the promised date.

Thank you.`,
        type: "PROMISE_REMINDER",
        sendWhatsapp: true,
      });
    }

    // ============================
    // Response
    // ============================
    return res.status(201).json({
      success: true,
      message: "Promise To Pay created successfully",
      data: {
        recoveryCaseId: recoveryCase._id,
        recoveryId: recoveryCase.recoveryId,
        promiseAmount,
        promiseDate,
        remarks,
        status: "ACTIVE",
        createdAt: recoveryCase.promiseDetails.createdAt,
      },
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
