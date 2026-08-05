import User from "../User/models.js";
import Kyc from "../kyc/kyc.model.js";
import BankAccount from "../bank-accounts/BankAccount.model.js";
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-mpin -fcmToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const kyc = await Kyc.findOne({
      userId: req.user.id,
    }).select("dob gender");

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),

          dob: kyc?.dob || null,
    gender: kyc?.gender || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVerificationStatus = async (req, res) => {
  try {
    const [kyc, bankAccount] = await Promise.all([
      Kyc.findOne({
        user: req.user.id,
      }),

      BankAccount.findOne({
        user: req.user.id,
        isPrimary: true,
      }).select("verified status"),
    ]);

    const aadhaarVerified = !!kyc?.aadhaarNumber;

    const panVerified = !!kyc?.panNumber;

    const personalDetailsCompleted =
      !!kyc?.fullName &&
      !!kyc?.dob &&
      !!kyc?.gender;

    const addressCompleted =
      !!kyc?.addressLine &&
      !!kyc?.city &&
      !!kyc?.state &&
      !!kyc?.pinCode;

    const occupationCompleted =
      !!kyc?.occupation &&
      !!kyc?.annualIncome;

    const bankVerified =
      bankAccount?.verified === true &&
      bankAccount?.status === "VERIFIED";

    // Agar koi bhi ek section complete/verified hai
    const isVerification =
      aadhaarVerified ||
      panVerified ||
      personalDetailsCompleted ||
      addressCompleted ||
      occupationCompleted ||
      bankVerified;

    return res.status(200).json({
      success: true,
      data: {
        isVerification,

        aadhaarVerified,
        panVerified,
        personalDetailsCompleted,
        addressCompleted,
        occupationCompleted,
        bankVerified,

        kycStatus: isVerification
          ? "VERIFIED"
          : "PENDING",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const getKycProgress = async (req, res) => {
  try {
        console.log("🔥 NEW getKycProgress CONTROLLER HIT");
    const [user, kyc, bankAccount] = await Promise.all([
      User.findById(req.user.id).select("mobile"),

      Kyc.findOne({
        user: req.user.id,
      }),

      BankAccount.findOne({
        user: req.user.id,
        isPrimary: true,
      }).select(
        "bankName accountHolderName accountNumber ifscCode branchName accountType isPrimary verified verificationMethod verificationReference verificationMessage status rejectedReason verifiedAt createdAt updatedAt"
      ),
    ]);

    // -------------------------
    // MASK FUNCTIONS
    // -------------------------

    const maskAadhaar = (aadhaar) => {
      if (!aadhaar) return null;

      return `XXXXXXXX${aadhaar.slice(-4)}`;
    };

    const maskPan = (pan) => {
      if (!pan) return null;

      return `${pan.slice(0, 5)}****${pan.slice(-1)}`;
    };

    const maskAccountNumber = (accountNumber) => {
      if (!accountNumber) return null;

      return `XXXXXX${accountNumber.slice(-4)}`;
    };

    // -------------------------
    // AADHAAR
    // -------------------------

    const aadhaarVerified =
      kyc?.aadhaarVerified === true;

    // -------------------------
    // PAN
    // -------------------------

    const panVerified =
      kyc?.panVerified === true;

    // -------------------------
    // PERSONAL DETAILS
    // -------------------------

    const personalDetailsCompleted =
      !!kyc?.fullName &&
      !!kyc?.dob &&
      !!kyc?.gender;

    // -------------------------
    // ADDRESS
    // -------------------------

    const addressCompleted =
      !!kyc?.addressLine &&
      !!kyc?.city &&
      !!kyc?.state &&
      !!kyc?.pinCode;

    // -------------------------
    // OCCUPATION
    // -------------------------

    const occupationCompleted =
      !!kyc?.occupation &&
      !!kyc?.annualIncome;

    // -------------------------
    // BANK VERIFICATION
    // -------------------------

    const bankVerified =
      bankAccount?.verified === true &&
      bankAccount?.status === "VERIFIED";

    const bankStatus =
      bankAccount?.status || "PENDING";

    // -------------------------
    // OVERALL KYC
    // -------------------------

    const isVerification =
      aadhaarVerified ||
      panVerified ||
      personalDetailsCompleted ||
      addressCompleted ||
      occupationCompleted ||
      bankVerified;

    const kycStatus =
      isVerification
        ? "VERIFIED"
        : "PENDING";

    // -------------------------
    // RESPONSE
    // -------------------------

    return res.status(200).json({
      success: true,

      data: {

        // =========================
        // OVERALL KYC
        // =========================

        isVerification,

        kycStatus,

        lastUpdatedAt:
          kyc?.updatedAt || null,

        // =========================
        // AADHAAR
        // =========================

        aadhaarVerified,

        aadhaarNumber:
          maskAadhaar(
            kyc?.aadhaarNumber
          ),

        // =========================
        // PAN
        // =========================

        panVerified,

        panNumber:
          maskPan(
            kyc?.panNumber
          ),

        // =========================
        // MOBILE
        // =========================

        mobileNumber:
          user?.mobile || null,

        // =========================
        // PERSONAL DETAILS
        // =========================

        personalDetailsCompleted,

        // =========================
        // ADDRESS
        // =========================

        addressCompleted,

        // =========================
        // OCCUPATION
        // =========================

        occupationCompleted,

        // =========================
        // BANK ACCOUNT
        // =========================

        bankVerified,

        bankStatus,

        bankDetails: bankAccount
          ? {
              bankName:
                bankAccount.bankName || null,

              accountHolderName:
                bankAccount.accountHolderName || null,

              accountNumber:
                maskAccountNumber(
                  bankAccount.accountNumber
                ),

              ifscCode:
                bankAccount.ifscCode || null,

              branchName:
                bankAccount.branchName || null,

              accountType:
                bankAccount.accountType || null,

              isPrimary:
                bankAccount.isPrimary || false,

              verified:
                bankAccount.verified || false,

              status:
                bankAccount.status || "PENDING",

              verificationMethod:
                bankAccount.verificationMethod || null,

              verificationReference:
                bankAccount.verificationReference || null,

              verificationMessage:
                bankAccount.verificationMessage || null,

              rejectedReason:
                bankAccount.rejectedReason || null,

              verifiedAt:
                bankAccount.verifiedAt || null,

              createdAt:
                bankAccount.createdAt || null,

              updatedAt:
                bankAccount.updatedAt || null,
            }
          : null,
      },
     
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};





