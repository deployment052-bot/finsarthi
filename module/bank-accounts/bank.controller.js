import BankAccount from "./BankAccount.model.js";
import { sendNotification } from "../notification/serrvice.js";

export const createBankAccount = async (
  req,
  res
) => {
  try {
    const bank = await BankAccount.create({
      user: req.user._id,
      ...req.body,
    });

       await sendNotification({
      userId: req.user._id,
      title: "Bank Account Added",
      message:
        "Your bank account has been added successfully.",
      type: "ACCOUNT",
      data: {
        screen: "BankDetails",
        bankId: bank._id.toString(),
      },
    });
    
    res.status(201).json({
      success: true,
      data: bank,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyBankAccount = async (
  req,
  res
) => {
  try {
    const accounts =
      await BankAccount.find({
        user: req.user._id,
      });

    res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//this is for mask details get 
export const getBankDetails = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const bank = await BankAccount.findOne({
      user: userId,
    });

    if (!bank) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    const maskAccountNumber = (account) => {
      if (!account) return null;

      const last4 = account.slice(-4);
      return `XXXXXX${last4}`;
    };

    return res.status(200).json({
      success: true,
      data: {
        bankId: bank._id,

        bankName: bank.bankName,

        accountHolderName:
          bank.accountHolderName,

        accountNumber:
          maskAccountNumber(
            bank.accountNumber
          ),

        ifscCode: bank.ifscCode,

        branchName:
          bank.branchName || null,

        accountType:
          bank.accountType,

        isPrimary:
          bank.isPrimary,

        bankVerified:
          bank.status === "VERIFIED",

        bankStatus:
          bank.status,

        verificationMethod:
          bank.verificationMethod,

        verificationMessage:
          bank.verificationMessage,

        verifiedAt:
          bank.verifiedAt,

        createdAt:
          bank.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Get Bank Details Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


