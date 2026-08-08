// loan-application/service/instantLoan.service.js

import notificationService from "../../notification/service/notification.service.js";
import LoanApplication from "../loanApplication.model.js";
import { checkEligibility } from "../../loan-products/service/eligibility.service.js";
import { decideLoan } from "../../loan-products/service/decision.service.js";
import User from "../../User/models.js";


export const applyInstantLoan = async (req, res, product) => {
  try {
    const { amount, tenure } = req.body;

    // Eligibility Check
    const eligibility = await checkEligibility(req.user);

    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: eligibility.reason,
      });
    }

    if (amount > eligibility.approvedLimit) {
      return res.status(400).json({
        success: false,
        message: "Requested amount exceeds approved limit.",
        approvedLimit: eligibility.approvedLimit,
      });
    }


    // Decision Engine
    const decision = decideLoan({
      score: eligibility.riskScore,
      amount,
      tenure,
      interestRate: product.interestRate,
      approvedLimit: eligibility.approvedLimit,
      monthlyIncome: eligibility.monthlyIncome,
      existingEMI: 0,
    });


    if (!decision.approved) {
      return res.status(400).json({
        success: false,
        message: decision.reason,
      });
    }


    // Create Loan Application
    const application = await LoanApplication.create({

      applicationId: `APP-${Date.now()}`,

      customer: req.user._id,

      product: product._id,

      amount,

      approvedAmount: 0,

      disbursedAmount: 0,

      outstandingAmount: 0,

      interestRate: product.interestRate,

      tenure,

      emiAmount: decision.emi,

      totalInterest: decision.totalInterest || 0,

      totalPayable: decision.totalPayable || 0,

      status:
        decision.type === "INSTANT"
          ? "APPROVED"
          : "UNDER_REVIEW",


      riskSnapshot: {

        score: eligibility.riskScore,

        grade: decision.grade,

        approvedLimit: eligibility.approvedLimit,

        engineVersion: "v1",

      },


      creditSnapshot: eligibility.creditData,

    });


    // Fetch Customer For WhatsApp
    const customer = await User.findById(req.user._id);


    if (!customer) {
      throw new Error("Customer not found");
    }


    // Notification + WhatsApp
// await notificationService.send({
//   user: customer._id,
//   phone: `91${customer.mobile}`,

//   title: "Loan Application Submitted",

//   // Optional Image (Cloudinary/S3/Public URL)
//   image:
//     "https://res.cloudinary.com/ddcy9noqo/image/upload/v1784358106/FinSarthi_Premium_Fintech_Logo_yvprkc.png",

//   // Optional PDF
//   document: null,
//   fileName: null,

//   message: `🏦 *FinSarthi*

// Dear *${customer.fullName}*,

// 🎉 Your loan application has been submitted successfully and is currently under review.

// ━━━━━━━━━━━━━━━━━━
// 📄 *Application ID:* ${application.applicationId}
// 💰 *Requested Amount:* ₹${application.amount.toLocaleString("en-IN")}
// 📌 *Current Status:* ${application.status.replace(/_/g, " ")}
// 📅 *Submitted On:* ${new Date(
//     application.createdAt
//   ).toLocaleDateString("en-IN")}
// ━━━━━━━━━━━━━━━━━━

// 📋 *What's Next?*
// ✅ Our team will review your application.
// ✅ If additional documents or verification are required, we'll notify you immediately.
// ✅ You'll receive instant updates whenever your application status changes.

// 📱 *Track Your Application*
// https://app.finsarthi.com/loan/${application.applicationId}

// 💬 Need assistance?
// Our support team is always here to help.

// Thank you for choosing *FinSarthi*.
// We're committed to providing a fast, secure, and transparent lending experience.

// _This is an automated notification. Please do not reply to this message._`,

//   type: "LOAN",
//   sendWhatsapp: true,
// });

    return res.status(201).json({

      success: true,

      message: "Loan applied successfully.",

      data: application,

    });


  } catch (error) {

    console.error("Instant Loan Error:", error);


    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }
};