import cron from "node-cron";

import recoveryService from "../service/recovery.service.js";

class RecoveryCron {

  start() {

    /**
     * Promise Break
     * Every day 12:05 AM
     */
    cron.schedule("5 0 * * *", async () => {

      try {

        console.log("Running Promise Break Cron");

        await recoveryService.processBrokenPromises();

      } catch (error) {

        console.error(
          "Promise Cron Error",
          error
        );

      }

    });




    /**
     * Followup Reminder
     * Every day 8 AM
     */
    cron.schedule("0 8 * * *", async () => {

      try {

        console.log("Running Followup Cron");

        await recoveryService.processTodayFollowups();

      } catch (error) {

        console.error(
          "Followup Cron Error",
          error
        );

      }

    });




    /**
     * Legal Escalation
     * Every day 1 AM
     */
    cron.schedule("0 1 * * *", async () => {

      try {

        console.log("Running Legal Cron");

        await recoveryService.processLegalCases();

      } catch (error) {

        console.error(
          "Legal Cron Error",
          error
        );

      }

    });

  }

}

export default new RecoveryCron();  