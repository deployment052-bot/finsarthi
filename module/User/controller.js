import User from "../User/models.js";
import Kyc from "../kyc/kyc.model.js";

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
    const kyc = await Kyc.findOne({
      user: req.user.id,
    }).select("status");

    return res.status(200).json({
      success: true,
      data: {
        isVerification: kyc?.status === "VERIFIED",
        kycStatus: kyc?.status || "PENDING",
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
    const [user, kyc] = await Promise.all([
      User.findById(req.user.id).select("mobile"),
      Kyc.findOne({ user: req.user.id }),
    ]);

    const maskAadhaar = (aadhaar) => {
      if (!aadhaar) return null;
      return `XXXXXXXX${aadhaar.slice(-4)}`;
    };

    const maskPan = (pan) => {
      if (!pan) return null;
      return `${pan.slice(0, 5)}****${pan.slice(-1)}`;
    };

    return res.status(200).json({
      success: true,
      data: {
        aadhaarVerified: !!kyc?.aadhaarNumber,
        aadhaarNumber: maskAadhaar(kyc?.aadhaarNumber),

        panVerified: !!kyc?.panNumber,
        panNumber: maskPan(kyc?.panNumber),

        mobileNumber: user?.mobile || null,

        personalDetailsCompleted:
          !!kyc?.fullName &&
          !!kyc?.dob &&
          !!kyc?.gender,

        addressCompleted:
          !!kyc?.addressLine &&
          !!kyc?.city &&
          !!kyc?.state &&
          !!kyc?.pinCode,

        occupationCompleted:
          !!kyc?.occupation &&
          !!kyc?.annualIncome,

        kycStatus: kyc?.status || "PENDING",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};