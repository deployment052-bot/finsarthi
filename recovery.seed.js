import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDB from "./config/database.js";

import RecoveryCase from "./module/recovery-emi/modelschema/RecoveryCase.js";
import RecoveryActivity from "./module/recovery-emi/modelschema/RecoveryActivity.js";

dotenv.config();


const seedRecoveryCases = async () => {

  try {

    await connectDB();


    await RecoveryCase.deleteMany({});

    await RecoveryActivity.deleteMany({});


    const employeeId = new mongoose.Types.ObjectId(
      "6a59cafa45b35488e2016a44"
    );


    // Dummy reference ids for testing
    const loanId = new mongoose.Types.ObjectId();

    const emiId = new mongoose.Types.ObjectId();

    const customerId = new mongoose.Types.ObjectId();


    const today = new Date();


    const tomorrow = new Date(
      today.getTime() + 
      24 * 60 * 60 * 1000
    );


    const cases = await RecoveryCase.insertMany([


      // =========================
      // PENDING CASE
      // =========================

      {
        recoveryId: "RC-PENDING-001",

        loan: loanId,

        emi: emiId,

        customer: customerId,

        assignedAgent: employeeId,


        outstandingAmount: 25000,

        penaltyAmount: 500,


        dpd: 45,


        priority: "HIGH",


        stage: "QUEUE",

        status: "OPEN",


        nextFollowupDate: tomorrow

      },



      // =========================
      // TODAY FOLLOWUP CASE
      // =========================

      {
        recoveryId: "RC-TODAY-001",

        loan: loanId,

        emi: emiId,

        customer: customerId,

        assignedAgent: employeeId,


        outstandingAmount: 15000,

        penaltyAmount: 200,


        dpd: 20,


        priority: "MEDIUM",


        stage: "PROMISE_TO_PAY",

        status: "IN_PROGRESS",


        promiseDetails: {

          amount: 5000,

          promisedDate: today,

          status: "ACTIVE",

          createdAt: today

        },


        nextFollowupDate: today

      },



      // =========================
      // COMPLETED CASE
      // =========================

      {
        recoveryId: "RC-COMPLETE-001",

        loan: loanId,

        emi: emiId,

        customer: customerId,

        assignedAgent: employeeId,


        outstandingAmount: 0,

        penaltyAmount: 0,


        dpd: 60,


        priority: "HIGH",


        stage: "SETTLED",

        status: "CLOSED",


        closedAt: today

      }


    ]);


    console.log(
      "Recovery Cases Seeded:",
      cases.length
    );


    console.log(
      cases.map(item => ({
        id:item._id,
        recoveryId:item.recoveryId
      }))
    );


    process.exit(0);


  } catch(error) {

    console.log(error);

    process.exit(1);

  }

};


seedRecoveryCases();