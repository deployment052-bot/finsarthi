import Payment from "./payment.model.js";
import LoanEMI from "../loan-emi/loanEMI.model.js";
import LoanApplication from "../loan-applications/loanApplication.model.js";
import paymentService from "./repayment.service.js"





export const getEMIPaymentSummary = async (req, res) => {
  try {
    const { emiId } = req.params;

    const emi = await LoanEMI.findOne({ emiId });

    if (!emi) {
      return res.status(404).json({
        success: false,
        message: "EMI not found",
      });
    }

    const loan = await LoanApplication.findById(emi.loan)
      .populate("customer", "fullName name firstName lastName")
      .populate("product", "name");

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    const customer =
      loan.customer?.fullName ||
      loan.customer?.name ||
      `${loan.customer?.firstName || ""} ${loan.customer?.lastName || ""}`.trim();

    const payableAmount = emi.emiAmount + emi.penaltyAmount;

    return res.status(200).json({
      success: true,
      data: {
        customerName: customer,

        loanId: loan.applicationId,

        loanAccount: loan.loanNumber,

        emiId: emi.emiId,

        emiNumber: emi.installmentNumber,

        emiAmount: emi.emiAmount,

        lateCharges: emi.penaltyAmount,

        totalPayable: payableAmount,

        dueDate: emi.dueDate,

        overdueDays: emi.overdueDays,

        status: emi.status,

        outstandingAmount: emi.outstandingAmount,

        principalAmount: emi.principalAmount,

        interestAmount: emi.interestAmount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const createPaymentIntent = async (req, res) => {
  try {
    const { emiId } = req.body;

    if (!emiId) {
      return res.status(400).json({
        success: false,
        message: "EMI ID is required.",
      });
    }

    const emi = await LoanEMI.findById(emiId).populate("loan");

    if (!emi) {
      return res.status(404).json({
        success: false,
        message: "EMI not found.",
      });
    }

    if (emi.status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "This EMI has already been paid.",
      });
    }

    if (emi.status === "UPCOMING") {
      return res.status(400).json({
        success: false,
        message: "This EMI is not due yet.",
      });
    }

    // -------------------------------
    // Calculate payable amount
    // -------------------------------
    const payableAmount =
      emi.totalDueAmount && emi.totalDueAmount > 0
        ? emi.totalDueAmount
        : emi.emiAmount + (emi.penaltyAmount || 0);

    // -------------------------------
    // Latest Payment
    // -------------------------------
    let payment = await Payment.findOne({
      emi: emi._id,
      user: req.user._id,
    }).sort({ createdAt: -1 });

    if (payment) {
      switch (payment.status) {
        case "SUCCESS":
          return res.status(200).json({
            success: true,
            action: "PAID",
            message: "This EMI is already paid.",
            data: payment,
          });

        case "UNDER_VERIFICATION":
          return res.status(200).json({
            success: true,
            action: "WAITING_VERIFICATION",
            message: "Payment is under verification.",
            data: payment,
          });

        case "CREATED":
          // Payment expired?
          if (
            payment.expiresAt &&
            payment.expiresAt < new Date()
          ) {
            payment.status = "EXPIRED";
            await payment.save();
            break;
          }

          // Wrong amount? (Old bug protection)
          if (payment.amount !== payableAmount) {
            payment.status = "EXPIRED";
            await payment.save();
            break;
          }

          return res.status(200).json({
            success: true,
            action: "RESUME_PAYMENT",
            message: "Resume your previous payment.",
            data: {
              paymentId: payment.paymentId,
              merchantReference: payment.merchantReference,
              amount: payment.amount,
              expiresAt: payment.expiresAt,
              upiLink: paymentService.generateUPILink(payment),
            },
          });

        case "FAILED":
        case "REJECTED":
        case "EXPIRED":
        case "CANCELLED":
          break;

        default:
          break;
      }
    }

    // -------------------------------
    // Create New Payment
    // -------------------------------
    const paymentId = `PAY${Date.now()}`;
    const merchantReference = `FS${Date.now()}`;

    payment = await Payment.create({
      paymentId,
      merchantReference,
      loan: emi.loan._id,
      emi: emi._id,
      user: req.user._id,
      amount: payableAmount,
      paymentSource: "FINSARTHI_APP",
      status: "CREATED",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      attemptCount: payment ? payment.attemptCount + 1 : 1,
      lastAttemptAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      action: "NEW_PAYMENT",
      message: "Payment intent created.",
      data: {
        paymentId: payment.paymentId,
        merchantReference: payment.merchantReference,
        amount: payment.amount,
        expiresAt: payment.expiresAt,
        upiLink: paymentService.generateUPILink(payment),
      },
    });

  } catch (error) {
    console.error("Create Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};



// SUBMIT UTR BY END-USER


export const submitPayment = async (req, res) => {
  try {

    const {
      paymentId,
      utrNumber,
      customerRemark,
    } = req.body;

    if (!paymentId || !utrNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Payment ID and UTR Number are required.",
      });
    }

    const payment =
      await paymentService.submitPayment({
        paymentId,
        utrNumber,
        customerRemark,
        userId: req.user._id,
      });

    return res.status(200).json({
      success: true,
      action: "WAITING_VERIFICATION",
      message:
        "Payment submitted successfully. Waiting for admin verification.",
      data: payment,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// Verify repayment
export const verifyRepayment = async (req, res) => {
  try {
const data = await paymentService.verifyRepayment({
  paymentId: req.params.id,
  adminId: req.user._id,
  ipAddress: req.ip,
  device: req.headers["user-agent"],
});

    res.json({
      success: true,
      message: "Repayment verified",
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject repayment
export const rejectRepayment = async (req, res) => {
  try {
    const data = await paymentService.rejectRepayment(
      req.params.id,
      req.user._id,
      req.body.remarks
    );

    res.json({
      success: true,
      message: "Repayment rejected",
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all
export const getAllRepayments = async (req, res) => {
  const data = await paymentService.getAll();
  res.json({ success: true, data });
};

// Get user repayments
export const getUserRepayments = async (req, res) => {
  const data = await paymentService.getByUser(req.user._id);
  res.json({ success: true, data });
};







