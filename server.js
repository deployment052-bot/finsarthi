import dotenv from "dotenv";
dotenv.config();

console.log("ENV CHECK:", {
  WASENDER_BASE_URL: process.env.WASENDER_BASE_URL,
  WASENDER_API_KEY: process.env.WASENDER_API_KEY ? "FOUND" : "MISSING",
});

import express from "express";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import connectDB from "./config/database.js";

// ==========================
// Routes
// ==========================
import auth from "./module/auth/auth.routes.js";
import key from "./module/kyc/kyc.routes.js";
import bank from "./module/bank-accounts/bankAccount.routes.js";
import system from "./module/settings/settings.routes.js";
import User from "./module/User/user.route.js";
import notification from "./module/notification/notifiction.route.js";
import permissionnotification from "./module/notification/notificationPreference.routes.js";
import ticket from "./module/support/ticket.route.js";
import Loanproduct from "./module/loan-products/loanProduct.routes.js";
import loanApplicationModel from "./module/loan-applications/loanApplication.routes.js";
import disbiursment from "./module/loan-disbursement/disbursement.routes.js";
import payment from "./module/payment/repayment.routes.js";
import recoveryroute from "./module/recovery-emi/recovery.routes.js";

// ==========================
// Cron Jobs
// ==========================
import "./module/loan-emi/overdue.cron.js";
import "./module/loan-emi/emiReminderCron.js"; // 👈 NEW
import recoveryCron from "./module/recovery-emi/cron/recovery.cron.js";

const app = express();

// ==========================
// Middleware
// ==========================
app.use(express.json());

// ==========================
// Database
// ==========================
connectDB();

// ==========================
// Start Recovery Cron
// ==========================
recoveryCron.start();

// ==========================
// API Routes
// ==========================
app.use("/auth/v1", auth);
app.use("/ekyc", key);
app.use("/bank", bank);
app.use("/system", system);
app.use("/User", User);
app.use("/notification", notification);
app.use("/notification-permission", permissionnotification);
app.use("/ticket", ticket);
app.use("/Get-Loan", Loanproduct);
app.use("/applyloan", loanApplicationModel);
app.use("/disbur", disbiursment);
app.use("/payemt", payment);
app.use("/recovery-modual", recoveryroute);

// ==========================
// Swagger
// ==========================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ==========================
// Start Server
// ==========================
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});