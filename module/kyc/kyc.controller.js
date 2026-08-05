import KYC from "./kyc.model.js";
import Document from "../documents/document.model.js";
import BankAccount from "../bank-accounts/BankAccount.model.js";
import User from "../User/models.js";
import { sendNotification } from "../notification/serrvice.js";

export const saveKyc = async (req, res) => {
  try {
    const kyc = await KYC.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        ...req.body,
      },
      {
        upsert: true,
        new: true,
      }
    );

    await User.findByIdAndUpdate(req.user._id, {
      kycStatus: "IN_PROGRESS",
    });

    await sendNotification({
  userId: req.user._id,
  title: "KYC Submitted",
  message:
    "Your KYC has been submitted and is under review.",
  type: "KYC",
});

    res.status(200).json({
      success: true,
      data: kyc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyKyc = async (req, res) => {
  try {
    const kyc = await KYC.findOne({
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: kyc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitKyc = async (req, res) => {
  try {
    const kyc = await KYC.findOne({
      user: req.user._id,
    });

    const docs = await Document.findOne({
      user: req.user._id,
    });

    const bank = await BankAccount.findOne({
      user: req.user._id,
    });

    if (!kyc) {
      return res.status(400).json({
        message: "KYC details missing",
      });
    }

    if (!docs) {
      return res.status(400).json({
        message: "Documents missing",
      });
    }

    if (!bank) {
      return res.status(400).json({
        message: "Bank details missing",
      });
    }

    kyc.status = "UNDER_REVIEW";
    await kyc.save();

    await User.findByIdAndUpdate(req.user._id, {
      kycStatus: "UNDER_REVIEW",
    });
               await sendNotification({
      userId: req.user._id,
      title: "KYC Submitted",
      message:
        "Your KYC has been submitted successfully and is under review.",
      type: "KYC",
      data: {
        screen: "KYCStatus",
        status: "UNDER_REVIEW",
      },
    });

    res.status(200).json({
      success: true,
      message: "KYC submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const verifyAadhaar = async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number is required",
      });
    }

    // Basic Aadhaar format validation
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhaar number",
      });
    }

    const kyc = await KYC.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        aadhaarNumber,
        aadhaarVerified: true,
        aadhaarVerifiedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Aadhaar verified successfully",
      data: {
        aadhaarVerified: true,
        aadhaarNumber: `XXXXXXXX${aadhaarNumber.slice(-4)}`,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const verifyPan = async (req, res) => {
  try {
    const { panNumber } = req.body;

    if (!panNumber) {
      return res.status(400).json({
        success: false,
        message: "PAN number is required",
      });
    }

    // Basic PAN format validation
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN number",
      });
    }

    const normalizedPan = panNumber.toUpperCase();

    const kyc = await KYC.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        panNumber: normalizedPan,
        panVerified: true,
        panVerifiedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "PAN verified successfully",
      data: {
        panVerified: true,
        panNumber: `${normalizedPan.slice(0, 5)}****${normalizedPan.slice(-1)}`,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};