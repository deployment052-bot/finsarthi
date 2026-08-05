import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import User from "../User/models.js";
import Otp from "./otp.model.js";
import { createSession } from "./service/createSession.js";
import Notification from "../notification/notification.model.js";
import whatsappService from "../notification/service/whatsapp.service.js";
import emailService from "../notification/service/email.service.js";
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      id: user._id,
      customerId: user.customerId,
      mobile: user.mobile,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
    }
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "30d",
    }
  );

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * SEND OTP
 */
export const sendOtpService = async ({ mobile }) => {
  if (!mobile) {
    throw new Error("Mobile number is required");
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    throw new Error("Invalid mobile number");
  }

  const otp = generateOtp();

  await Otp.deleteMany({ mobile });

  await Otp.create({
    mobile,
    otp,
    verified: false,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  if (process.env.NODE_ENV === "development") {
    console.log("================================");
    console.log("Mobile :", mobile);
    console.log("OTP    :", otp);
    console.log("================================");
  }

  return {
    message: "OTP sent successfully",
    ...(process.env.NODE_ENV === "development" && { otp }),
  };
};

/**
 * VERIFY OTP
 */
export const verifyOtpService = async ({
  mobile,
  otp,
  req,
}) => {
  if (!mobile || !otp) {
    throw new Error("Mobile and OTP are required");
  }

  const otpDoc = await Otp.findOne({ mobile });

  if (!otpDoc) {
    throw new Error("OTP not found");
  }

  if (otpDoc.verified) {
    throw new Error("OTP already used");
  }

  if (new Date() > otpDoc.expiresAt) {
    await Otp.deleteOne({ _id: otpDoc._id });
    throw new Error("OTP expired");
  }

  if (otpDoc.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  otpDoc.verified = true;
  await otpDoc.save();

  const user = await User.findOne({ mobile });

  if (!user) {
    return {
      message: "OTP verified successfully",
      isRegistered: false,
    };
  }

  const { accessToken, refreshToken } =
    generateTokens(user);

  return {
    message: "Login successful",
    isRegistered: true,
    user: {
      customerId: user.customerId,
      fullName: user.fullName,
      mobile: user.mobile,
      email: user.email,
      mobileVerified: user.mobileVerified,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * REGISTER USER
 */
export const registerService = async ({
  fullName,
  mobile,
  email,
  mpin,
  req,
}) => {
  // 1️⃣ Basic validation
  if (!fullName || !mobile || !email || !mpin) {
    throw new Error(
      "Full name, mobile, email and MPIN are required"
    );
  }

  // 2️⃣ Check OTP verification
  const otpDoc = await Otp.findOne({
    mobile,
    verified: true,
  });

  if (!otpDoc) {
    throw new Error("Please verify OTP first");
  }

  // 3️⃣ Check existing mobile
  const mobileExists = await User.findOne({ mobile });

  if (mobileExists) {
    // OTP invalidate
    await Otp.deleteMany({ mobile });

    throw new Error("Mobile already registered");
  }

  // 4️⃣ Check existing email
  const emailExists = await User.findOne({ email });

  if (emailExists) {
    // OTP invalidate
    await Otp.deleteMany({ mobile });

    throw new Error("Email already registered");
  }

  // 5️⃣ Hash MPIN
  const hashedMpin = await bcrypt.hash(mpin, 10);

  // 6️⃣ Create customer ID
  const customerId =
    `FS${Date.now()}${nanoid(4).toUpperCase()}`;

  // 7️⃣ Create user
  const user = await User.create({
    customerId,
    fullName,
    mobile,
    email,
    mpin: hashedMpin,
    mobileVerified: true,
  });
// 1️⃣ IN-APP NOTIFICATION
await Notification.create({
  user: user._id,
  title: "Welcome to FinSarthi 🎉",
  message: `Hi ${user.fullName}, your account has been successfully created.`,
  type: "ACCOUNT",
  visible: true,
  read: false,
  data: {
    screen: "Home",
    action: "REGISTRATION_SUCCESS",
  },
});

try {
  await emailService.sendEmail({
    to: user.email,

    subject: "Welcome to FinSarthi 🎉",

    text: `Hi ${user.fullName}, your FinSarthi account has been successfully created.`,

    html: `
      <div>
        <h2>Welcome to FinSarthi 🎉</h2>

        <p>Hi ${user.fullName},</p>

        <p>
          Your FinSarthi account has been successfully created.
        </p>

        <p>
          You can now login and start using FinSarthi.
        </p>

        <br />

        <p>Regards,<br/>FinSarthi Team</p>
      </div>
    `,
  });

  console.log("✅ Registration Email Sent");

} catch (error) {
  console.error(
    "❌ Registration Email Error:",
    error.message
  );
}

try {
  await whatsappService.sendText(
    user.mobile,
    `Hi ${user.fullName}, your FinSarthi account has been successfully created. 🎉`
  );
} catch (error) {
  console.error(
    "WhatsApp Error:",
    error.message
  );
}
  // 8️⃣ OTP is consumed after successful registration
  await Otp.deleteMany({ mobile });

  // 9️⃣ Create session
  const { accessToken, refreshToken } =
    await createSession({
      user,
      req,
      userType: "User",
    });

  return {
    message: "User registered successfully",

    data: {
      customerId: user.customerId,
      fullName: user.fullName,
      mobile: user.mobile,
      email: user.email,
      mobileVerified: user.mobileVerified,
    },

    accessToken,
    refreshToken,
  };
};


export const loginService = async ({
  mobile,
  mpin,
  deviceId,
  deviceType,
  fcmToken,
  req,
}) => {
  if (!mobile || !mpin) {
    throw new Error("Mobile and MPIN are required");
  }

  const user = await User.findOne({ mobile });

  if (!user) {
    throw new Error("User not found");
  }

  // 🔐 MPIN verify
  const isMatch = await bcrypt.compare(mpin, user.mpin);

  if (!isMatch) {
    throw new Error("Invalid MPIN");
  }

  // 📱 device tracking update
  user.lastLoginDevice = deviceId || null;
  user.deviceType = deviceType || null;
  user.fcmToken = fcmToken || null;
  user.lastLoginAt = new Date();

  await user.save();

  // 🔑 tokens generate
const { accessToken, refreshToken } =
  await createSession({
    user,
    req,
    userType: "User",
  });
  return {
    message: "Login successful",
    data: {
      customerId: user.customerId,
      fullName: user.fullName,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};




