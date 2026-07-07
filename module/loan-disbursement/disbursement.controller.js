import disbursementService from "./disbursement.service.js";

// =============================
// CREATE
// =============================
export const createDisbursement = async (req, res) => {
  try {
    const data = await disbursementService.createDisbursement({
      ...req.body,
      createdBy: req.user?._id, // safe optional chaining
    });

    return res.status(201).json({
      success: true,
      message: "Disbursement request created",
      data,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================
// APPROVE
// =============================
export const approveDisbursement = async (req, res) => {
  try {
    const data = await disbursementService.approveDisbursement(
      req.params.id,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Disbursement approved",
      data,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================
// REJECT
// =============================
export const rejectDisbursement = async (req, res) => {
  try {
    const data = await disbursementService.rejectDisbursement(
      req.params.id,
      req.user._id,
      req.body.remarks
    );

    return res.status(200).json({
      success: true,
      message: "Disbursement rejected",
      data,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================
// MARK COMPLETED
// =============================
export const markCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { utrNumber } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Disbursement ID is required.",
      });
    }

    if (!utrNumber) {
      return res.status(400).json({
        success: false,
        message: "UTR Number is required.",
      });
    }

    const data = await disbursementService.markCompleted(
      id,
      utrNumber
    );

    return res.status(200).json({
      success: true,
      message: "Disbursement completed successfully.",
      data,
    });
  } catch (error) {
    console.error("Mark Completed Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
// =============================
// GET ALL
// =============================
export const getAll = async (req, res) => {
  try {
    const data = await disbursementService.getAll();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================
// GET BY ID
// =============================
export const getById = async (req, res) => {
  try {
    const data = await disbursementService.getById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Disbursement not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};