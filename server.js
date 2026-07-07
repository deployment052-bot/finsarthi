import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/database.js";
import auth from "./module/auth/auth.routes.js"
import key from "./module/kyc/kyc.routes.js"
import bank from "./module/bank-accounts/bankAccount.routes.js"
import system from "./module/settings/settings.routes.js"
import User from "./module/User/user.route.js"
import notification from "./module/notification/notifiction.route.js"
import permissionnotification from "./module/notification/notificationPreference.routes.js"
import ticket from "./module/support/ticket.route.js"
import Loanproduct from "./module/loan-products/loanProduct.routes.js"
import loanApplicationModel from "./module/loan-applications/loanApplication.routes.js";
import disbiursment from "./module/loan-disbursement/disbursement.routes.js"
import payment from "./module/payment/repayment.routes.js"
import "./module/loan-emi/overdue.cron.js";
const app = express();

app.use(express.json());

connectDB();
app.use('/auth/v1',auth)
app.use('/ekyc',key)
app.use('/bank',bank)
app.use('/system',system)
app.use('/User',User)
app.use('/notification',notification)
app.use('/notification-permission',permissionnotification)
app.use('/ticket',ticket)
app.use('/Get-Loan',Loanproduct)
app.use('/applyloan',loanApplicationModel)
app.use('/disbur',disbiursment)
app.use('/payemt',payment)

app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
});