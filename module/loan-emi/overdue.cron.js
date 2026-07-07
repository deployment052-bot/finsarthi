import cron from "node-cron";
import LoanEMI from "./loanEMI.model.js";
import LoanApplication from "../loan-applications/loanApplication.model.js";
import LoanProduct from "../loan-products/loanProduct.model.js";

// ============================================
// RUN EVERY DAY AT 12:05 AM
// ============================================
cron.schedule("* * * * *", async () => {
  console.log("======================================");
  console.log("Running Overdue Cron...");
  console.log("Time:", new Date());
  console.log("======================================");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all unpaid EMIs
    const emis = await LoanEMI.find({
      status: {
        $in: ["DUE", "OVERDUE", "PARTIAL"],
      },
      isClosed: false,
      penaltyStopped: false,
    });

    console.log(`Found ${emis.length} EMI(s)`);

for (const emi of emis) {
  try {
    const dueDate = new Date(emi.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    console.log("=================================");
    console.log("Checking EMI:", emi.emiId);
    console.log({
      today,
      dueDate,
      status: emi.status,
      isClosed: emi.isClosed,
      penaltyStopped: emi.penaltyStopped,
    });

    // Skip if not overdue
    if (today <= dueDate) {
      console.log("❌ Skipped: Due date has not passed yet.");
      continue;
    }

    console.log("✅ Due date passed.");

        const loan = await LoanApplication.findById(emi.loan);

        if (!loan) continue;

    const loanProduct = await LoanProduct.findById(
  loan.product
);

        if (!loanProduct) continue;

        if (!loanProduct.overdue?.enabled) continue;

        const graceDays = loanProduct.overdue.graceDays || 0;

        const overdueDays = Math.floor(
          (today - dueDate) / (1000 * 60 * 60 * 24)
        ) - graceDays;

        if (overdueDays <= 0) continue;

        let penalty = 0;

        // FIXED PENALTY
        if (loanProduct.overdue.type === "FIXED") {
          penalty =
            loanProduct.overdue.value *
            overdueDays;
        }

        // PERCENTAGE PENALTY
        else {
          const dailyPenalty =
            (emi.emiAmount *
              loanProduct.overdue.value) /
            100;

          penalty = dailyPenalty * overdueDays;
        }

        // Maximum Penalty
        if (loanProduct.overdue.maxPenaltyPercentage) {
          const maxPenalty =
            (emi.emiAmount *
              loanProduct.overdue.maxPenaltyPercentage) /
            100;

          penalty = Math.min(
            penalty,
            maxPenalty
          );
        }

        emi.overdueDays = overdueDays;
        emi.penaltyAmount = Math.round(penalty);
        emi.totalDueAmount =
          emi.emiAmount + Math.round(penalty);

        emi.status = "OVERDUE";

        emi.lastPenaltyCalculatedAt = new Date();

        await emi.save();

        console.log(
          `Updated EMI ${emi.emiId} | Penalty ₹${emi.penaltyAmount}`
        );
      } catch (err) {
        console.error(
          "EMI Update Error:",
          emi.emiId,
          err.message
        );
      }
    }

    console.log("Overdue Cron Finished.");
  } catch (err) {
    console.error(err);
  }
});