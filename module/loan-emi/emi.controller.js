import emiService from "./emi.service.js";

// Generate EMI after disbursement
export const generateEMIs = async (req, res) => {
  try {
    const data = await emiService.generateEMIs(req.params.loanId);

    res.status(201).json({
      success: true,
      message: "EMI schedule generated",
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get EMI list
export const getEMIsByLoan = async (req, res) => {
  try {
    const data = await emiService.getEMIsByLoan(req.params.loanId);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Pay EMI
export const payEMI = async (req, res) => {
  try {
    const data = await emiService.payEMI(
      req.params.emiId,
      req.body.amount
    );

    res.json({
      success: true,
      message: "EMI updated",
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPaymentIntent = async (req, res) => {
  try {
    const { emiId } = req.body;

    const emi = await LoanEMI.findById(emiId)
      .populate("loan");

    if (!emi) {
      return res.status(404).json({
        success: false,
        message: "EMI not found",
      });
    }

    const payment = await Payment.create({
      paymentId: `PAY-${Date.now()}`,
      loan: emi.loan._id,
      emi: emi._id,
      user: req.user._id,
      amount: emi.outstandingAmount,
      status: "CREATED",
    });

    const upiId = "collections@finsarthi";

    const upiLink =
      `upi://pay?pa=${upiId}` +
      `&pn=FinSarthi` +
      `&am=${emi.outstandingAmount}` +
      `&cu=INR` +
      `&tn=${payment.paymentId}`;

    res.status(201).json({
      success: true,
      payment,
      upiLink,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};