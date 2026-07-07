import mongoose from "mongoose";
import approvalService from "../loanApproval.model.js";
import LoanApplication from "../loanApplication.model.js";
import User from "../../User/user.route.js"
import { applyManualLoan } from "../service.js/manualLoan.service.js";
import { applyInstantLoan } from "../service.js/instantLoan.service.js";
import {uploadToCloudinary} 
from "../service.js/visitorVerification.service.js";

export const createApproval = async (req, res) => {
  try {
    const approval = await approvalService.createApproval(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Loan approval created successfully.",
      data: approval,
    });
  } catch (error) {
    console.error("Create Approval Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const approveLoan = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { loanId } = req.params;

    const {
      approvedAmount,
      approvedTenure,
      interestRate,
      processingFee = 0,
      remarks = "",
    } = req.body || {};

    if (!approvedAmount || !approvedTenure || !interestRate) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message:
          "approvedAmount, approvedTenure and interestRate are required",
      });
    }

    const loan = await LoanApplication.findById(loanId).session(session);

    if (!loan) {
      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        success: false,
        message: "Loan Application not found",
      });
    }

    if (loan.status !== "UNDER_REVIEW") {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Loan is not under review",
      });
    }

    // Update LoanApplication
    const updatedLoan = await LoanApplication.findByIdAndUpdate(
      loanId,
      {
        $set: {
          status: "APPROVED",
          stage: "DISBURSEMENT",
          approvedAmount,
          interestRate,
          tenure: approvedTenure,
        },
      },
      {
        new: true,
        session,
      }
    );

    // Approval History
    const approval = await approvalService.create(
      [
        {
          loan: updatedLoan._id,
          reviewer: req.user._id,
          approver: req.user._id,
          status: "APPROVED",
          approvedAmount,
          approvedTenure,
          interestRate,
          processingFee,
          remarks,
          approvedAt: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Loan approved successfully.",
      data: {
        loan: updatedLoan,
        approval: approval[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Approve Loan Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectLoan = async (req, res) => {
  try {
    const approval = await approvalService.rejectLoan(
      req.params.loanId,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Loan rejected successfully.",
      data: approval,
    });
  } catch (error) {
    console.error("Reject Loan Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Approval
 * PATCH /loan-approval/:loanId
 */
export const updateApproval = async (req, res) => {
  try {
    const approval = await approvalService.updateApproval(
      req.params.loanId,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Loan approval updated successfully.",
      data: approval,
    });
  } catch (error) {
    console.error("Update Approval Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cancel Approval
 * PATCH /loan-approval/:loanId/cancel
 */
export const cancelApproval = async (req, res) => {
  try {
    const approval = await approvalService.cancelApproval(
      req.params.loanId,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Loan approval cancelled successfully.",
      data: approval,
    });
  } catch (error) {
    console.error("Cancel Approval Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Approval By Loan Id
 * GET /loan-approval/:loanId
 */
// export const getApproval = async (req, res) => {
//   try {
//     const approval = await approvalService.getApproval(
//       req.params.loanId
//     );

//     return res.status(200).json({
//       success: true,
//       data: approval,
//     });
//   } catch (error) {
//     console.error("Get Approval Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

/**
 * Get All Pending Approvals
 * GET /loan-approval/pending
 */
export const getPendingApprovals = async (req, res) => {
  try {
    const approvals = await LoanApplication.find({
      status: "UNDER_REVIEW",
    })
      .populate("customer", "name email phone")
      .populate("product");

    return res.status(200).json({
      success: true,
      count: approvals.length,
      data: approvals,
    });
  } catch (error) {
    console.error("Pending Approvals Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Approved Loans
 * GET /loan-approval/approved
 */
export const getApprovedLoans = async (req, res) => {
  try {
    const approvals =
      await approvalService.getApprovedLoans();

    return res.status(200).json({
      success: true,
      count: approvals.length,
      data: approvals,
    });
  } catch (error) {
    console.error("Approved Loans Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Rejected Loans
 * GET /loan-approval/rejected
 */
export const getRejectedLoans = async (req, res) => {
  try {
    const approvals =
      await approvalService.getRejectedLoans();

    return res.status(200).json({
      success: true,
      count: approvals.length,
      data: approvals,
    });
  } catch (error) {
    console.error("Rejected Loans Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const assignVisitor = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { loanId } = req.params;
    const { visitorId } = req.body;

    if (!visitorId) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Visitor is required.",
      });
    }

    // Get Loan
    const loan = await LoanApplication.findById(loanId)
      .populate("product")
      .session(session);

    if (!loan || loan.isDeleted) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Loan application not found.",
      });
    }

    // Only Manual Loan
    if (loan.product.processingType !== "MANUAL") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Visitor can only be assigned to manual loans.",
      });
    }

    // Only Submitted Loan
    if (
      !["SUBMITTED", "DOCUMENT_PENDING"].includes(
        loan.status
      )
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Visitor cannot be assigned at current loan status.",
      });
    }

    // Already Assigned
    if (loan.assignedVisitor) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Visitor already assigned.",
      });
    }

    // Get Visitor
    const visitor = await User.findById(visitorId).session(
      session
    );

    if (!visitor) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Visitor not found.",
      });
    }

    if (visitor.role !== "VISITOR") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Selected user is not a visitor.",
      });
    }

    if (!visitor.isActive) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Visitor account is inactive.",
      });
    }

    // Update Loan
    loan.assignedVisitor = visitor._id;
    loan.visitorAssignedAt = new Date();
    loan.stage = "VISITOR_VERIFICATION";
    loan.status = "VISITOR_ASSIGNED";

    await loan.save({ session });

    // Create Verification Record
await VisitorVerification.create([
{
    verificationId: `VV-${Date.now()}`,
    loan: loan._id,
    customer: loan.customer,
    visitor: visitor._id,

    status: "ASSIGNED",

    photos: [],
    video: null,
    documents: [],

    investigation: {},
    location: {},

    witness: {},

    customerConsent: {},

    visitorDeclaration: {},

    recommendation: null,

    remarks: "",

    startedAt: null
}
],{session})

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Visitor assigned successfully.",
      data: loan,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const getAllVisitors = async (req, res) => {
  try {
    const visitors = await User.find({
      role: "VISITOR",
      isDeleted: false,
      isActive: true,
    })
      .select(
        "_id fullName employeeId mobile email profileImage"
      )
      .sort({ fullName: 1 });

    return res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    console.error("Get Visitors Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVisitorActivity = async (req, res) => {
  try {
    const visitorId = req.user._id;

    const [
      assigned,
      inProgress,
      submitted,
      approved,
      rejected,
      today
    ] = await Promise.all([

      VisitorVerification.countDocuments({
        visitor: visitorId,
        status: "ASSIGNED"
      }),

      VisitorVerification.countDocuments({
        visitor: visitorId,
        status: "IN_PROGRESS"
      }),

      VisitorVerification.countDocuments({
        visitor: visitorId,
        status: "SUBMITTED"
      }),

      VisitorVerification.countDocuments({
        visitor: visitorId,
        status: "APPROVED"
      }),

      VisitorVerification.countDocuments({
        visitor: visitorId,
        status: "REJECTED"
      }),

      VisitorVerification.find({
        visitor: visitorId
      })
      .populate({
        path: "loan",
        select: "applicationId amount status customer",
        populate: {
          path: "customer",
          select: "fullName mobile"
        }
      })
      .sort({ createdAt: -1 })
      .limit(10)

    ]);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          assigned,
          inProgress,
          submitted,
          approved,
          rejected
        },
        recentActivities: today
      }
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

export const submitVerification = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { loanId } = req.params;

    const verification = await VisitorVerification.findOne({
      loan: loanId,
      visitor: req.user._id,
    }).session(session);

    if (!verification) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Verification not found.",
      });
    }

    if (verification.status === "SUBMITTED") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Verification already submitted.",
      });
    }

    // Required validations
    if (!verification.customerConsent?.accepted) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Customer consent is required.",
      });
    }

    if (!verification.witness?.agreed) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Witness approval is required.",
      });
    }

    if (!verification.recommendation) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Recommendation is required.",
      });
    }

    const loan = await LoanApplication.findById(loanId).session(session);

    if (!loan) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Loan not found.",
      });
    }

    verification.status = "SUBMITTED";
    verification.submittedAt = new Date();
    verification.completedAt = new Date();

    await verification.save({ session });

    loan.status = "UNDER_REVIEW";
    loan.stage = "ADMIN_REVIEW";

    await loan.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Verification submitted successfully. Waiting for admin approval.",
    });

  } catch (error) {

    await session.abortTransaction();

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  } finally {
    session.endSession();
  }
};




export const saveInvestigation = async(req,res)=>{

const {loanId}=req.params;

const verification=await VisitorVerification.findOne({

loan:loanId,

visitor:req.user._id

});

if(!verification){

return res.status(404).json({

success:false,

message:"Verification not found."

});

}

if(verification.status==="SUBMITTED"){

return res.status(400).json({

success:false,

message:"Already submitted."

});

}

const{

investigation,

location,

recommendation,

remarks

}=req.body;


if(investigation)
verification.investigation=investigation;

if(location)
verification.location=location;

if(recommendation)
verification.recommendation=recommendation;

if(remarks)
verification.remarks=remarks;


if(verification.status==="ASSIGNED"){

verification.status="IN_PROGRESS";

verification.startedAt=new Date();

}

await verification.save();

return res.json({

success:true,

message:"Investigation saved.",

data:verification

});

}
export const uploadPhoto = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { category } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required.",
      });
    }

    const allowedCategories = [
      "HOUSE",
      "SHOP",
      "OFFICE",
      "CUSTOMER",
      "DOCUMENT",
      "OTHER",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid photo category.",
      });
    }

    // Find verification of logged-in visitor
    const verification = await VisitorVerification.findOne({
      loan: loanId,
      visitor: req.user._id,
    });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification not found.",
      });
    }

    // Don't allow upload after submission
    if (verification.status === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Verification already submitted.",
      });
    }

    // Maximum photo validation
    if (verification.photos.length >= 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 photos allowed.",
      });
    }

    // Upload to Cloudinary
    const uploaded = await uploadToCloudinary(
      req.file.buffer,
      `visitor-verification/${loanId}/photos`
    );

    // Save photo metadata
    verification.photos.push({
      category,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
    });

    // First activity starts verification
    if (verification.status === "ASSIGNED") {
      verification.status = "IN_PROGRESS";
      verification.startedAt = new Date();
    }

    await verification.save();

    return res.status(201).json({
      success: true,
      message: "Photo uploaded successfully.",
      data: verification.photos[verification.photos.length - 1],
    });
  } catch (error) {
    console.error("Upload Photo Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const saveWitness = async (req, res) => {
  try {
    const { loanId } = req.params;

    const verification = await VisitorVerification.findOne({
      loan: loanId,
      visitor: req.user._id,
    });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification not found.",
      });
    }

    if (verification.status === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Verification already submitted.",
      });
    }

    const {
      fullName,
      mobile,
      relation,
      idType,
      idNumber,
      agreed,
    } = req.body;

    if (fullName) verification.witness.fullName = fullName;

    if (mobile) verification.witness.mobile = mobile;

    if (relation) verification.witness.relation = relation;

    if (idType) verification.witness.idType = idType;

    if (idNumber) verification.witness.idNumber = idNumber;

    if (typeof agreed === "boolean") {
      verification.witness.agreed = agreed;

      if (agreed) {
        verification.witness.signedAt = new Date();
      }
    }

    if (verification.status === "ASSIGNED") {
      verification.status = "IN_PROGRESS";
      verification.startedAt = new Date();
    }

    await verification.save();

    return res.status(200).json({
      success: true,
      message: "Witness details saved successfully.",
      data: verification.witness,
    });
  } catch (error) {
    console.error("Save Witness Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};