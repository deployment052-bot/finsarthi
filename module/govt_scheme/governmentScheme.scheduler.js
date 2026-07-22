import cron from "node-cron";
import governmentSchemeService from "./governmentScheme.service.js";

class GovernmentSchemeScheduler {

  start() {

    console.log("======================================");
    console.log("Government Scheme Scheduler Started");
    console.log("======================================");

    // Every day at 2:00 AM
    cron.schedule("0 2 * * *", async () => {

      console.log("======================================");
      console.log("Government Scheme Sync Started");
      console.log("======================================");

      try {

        await governmentSchemeService.syncSchemes();

        console.log("Government Scheme Sync Completed");

      } catch (error) {

        console.error(error);

      }

    });

  }

}

export default new GovernmentSchemeScheduler();