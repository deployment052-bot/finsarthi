import cron from "node-cron";
import LoanEMI from "./loanEMI.model.js";
import LoanApplication from "../loan-applications/loanApplication.model.js";
import notificationService from "../notification/service/notification.service.js";

// ============================================
// RUN EVERY DAY AT 9:00 AM
// ============================================
// Production
// cron.schedule("0 9 * * *", async () => {

// Development
cron.schedule("* * * * *", async () => {
  console.log("======================================");
  console.log("Running EMI Reminder Cron...");
  console.log("Time:", new Date());
  console.log("======================================");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

       const emis = await LoanEMI.find({
   
      isClosed: false,
    });

    console.log(`Found ${emis.length} EMI(s)`);

    for (const emi of emis) {
      try {
        const dueDate = new Date(emi.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const remainingDays = Math.ceil(
          (dueDate - today) / (1000 * 60 * 60 * 24),
        );

        // Only reminder dates
        if (![2, 1, 0].includes(remainingDays)) {
          continue;
        }

        // Duplicate prevention
        if (
          (remainingDays === 2 && emi.twoDaysReminderSent) ||
          (remainingDays === 1 && emi.oneDayReminderSent) ||
          (remainingDays === 0 && emi.dueTodayReminderSent)
        ) {
          continue;
        }

        const loan = await LoanApplication.findById(emi.loan).populate(
          "customer",
        );

        if (!loan || !loan.customer) {
          continue;
        }

        let heading = "";
        let body = "";

        if (remainingDays === 2) {
          heading = "EMI Due in 2 Days";

          body =
            "This is a friendly reminder that your EMI payment is due in 2 days.";
        }

        if (remainingDays === 1) {
          heading = "EMI Due Tomorrow";

          body =
            "Your EMI payment is due tomorrow. Please pay on time to avoid overdue charges.";
        }

        if (remainingDays === 0) {
          heading = "EMI Due Today";

          body =
            "Your EMI payment is due today. Kindly complete the payment to avoid overdue penalties.";
        }

      await notificationService.send({
  user: loan.customer._id,

  phone: `91${loan.customer.mobile}`,

  title: heading,

  message: `🏦 *FinSarthi EMI Reminder*

Dear *${loan.customer.fullName}*,

This is a gentle reminder regarding your upcoming EMI payment.

━━━━━━━━━━━━━━━━━━
💳 *Loan EMI Details*
━━━━━━━━━━━━━━━━━━
💰 *EMI Amount:* ₹${emi.emiAmount.toLocaleString("en-IN")}
📅 *Due Date:* ${dueDate.toLocaleDateString("en-IN")}
📌 *EMI ID:* ${emi.emiId}
━━━━━━━━━━━━━━━━━━

To avoid any late payment charges and maintain a good repayment record, kindly complete your EMI payment on or before the due date.

🔗 *Pay EMI Now*
https://app.finsarthi.com/loan/${loan._id}

Thank you for choosing *FinSarthi*.

For any assistance, please contact our support team.

_This is an automated notification. Please do not reply._`,

  type: "EMI_REMINDER",

  sendWhatsapp: true,
});

        if (remainingDays === 2) emi.twoDaysReminderSent = true;

        if (remainingDays === 1) emi.oneDayReminderSent = true;

        if (remainingDays === 0) emi.dueTodayReminderSent = true;

        await emi.save();

        console.log(`✅ Reminder Sent | EMI: ${emi.emiId}`);
      } catch (err) {
        console.error(`❌ EMI ${emi.emiId} Error:`, err.message);
      }
    }

    console.log("EMI Reminder Cron Finished.");
  } catch (err) {
    console.error(err);
  }
});
