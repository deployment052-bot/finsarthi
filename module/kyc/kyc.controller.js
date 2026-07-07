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