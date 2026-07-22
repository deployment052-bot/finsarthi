import RecoveryCase from "../modelschema/RecoveryCase.js";
import RecoveryActivity from "../modelschema/RecoveryActivity.js";

import Payment from "../../payment/payment.model.js";
import EMI from "../../loan-emi/loanEMI.model.js";


class RecoveryRepository {


  /**
   * Get Recovery Queue
   */
  async getQueue(filters = {}) {

    const {
      page = 1,
      limit = 10,
      search,
      priority,
      status,
      stage,
    } = filters;


    const query = {};


    if(priority)
      query.priority = priority;


    if(status)
      query.status = status;


    if(stage)
      query.stage = stage;



    const skip =
      (page - 1) * limit;



    let data =
      await RecoveryCase.find(query)

      .populate({
        path:"customer",
        select:"fullName mobile email"
      })

      .populate({
        path:"loan",
        select:"loanNumber"
      })

      .populate({
        path:"emi",
        select:"installmentNumber dueDate emiAmount outstandingAmount"
      })

      .populate({
        path:"assignedAgent",
        select:"fullName employeeId"
      })

      .sort({
        createdAt:-1
      })

      .skip(skip)

      .limit(limit);



    if(search){

      const keyword =
      search.toLowerCase();


      data =
      data.filter(item=>{

        return (

          item.customer?.fullName
          ?.toLowerCase()
          .includes(keyword)

          ||

          item.customer?.mobile
          ?.includes(keyword)

          ||

          item.loan?.loanNumber
          ?.toLowerCase()
          .includes(keyword)

          ||

          item.recoveryId
          ?.toLowerCase()
          .includes(keyword)

        );

      });

    }



    const total =
    await RecoveryCase.countDocuments(query);



    return {

      total,

      page:Number(page),

      limit:Number(limit),

      totalPages:
      Math.ceil(total / limit),

      data

    };

  }





  /**
   * Find Recovery Case
   */
  async findById(id){

    return RecoveryCase.findById(id)

    .populate("customer")

    .populate("loan")

    .populate("emi")

    .populate("assignedAgent");

  }





  /**
   * Find By EMI
   */
  async findByEmi(emiId){

    return RecoveryCase.findOne({
      emi:emiId
    });

  }





  /**
   * Create Recovery Case
   */
  async createRecoveryCase(payload){

    return RecoveryCase.create(payload);

  }





  /**
   * Update Recovery Case
   */
  async updateRecoveryCase(
    id,
    payload,
    options={}
  ){

    return RecoveryCase.findByIdAndUpdate(

      id,

      payload,

      {

        new:true,

        runValidators:true,

        ...options

      }

    );

  }





  /**
   * Assign Collection Agent
   */
  async assignAgent(
    caseId,
    agentId,
    adminId
  ){

    return RecoveryCase.findByIdAndUpdate(

      caseId,

      {

        assignedAgent:agentId,

        assignedBy:adminId,

        assignedAt:new Date(),


        stage:"ASSIGNED",

        status:"ASSIGNED"

      },

      {

        new:true

      }

    );

  }





  /**
   * Start Recovery
   */
  async startRecovery(caseId){


    return RecoveryCase.findByIdAndUpdate(

      caseId,

      {

        status:"IN_PROGRESS",

        stage:"CALLING"

      },

      {

        new:true

      }

    )

    .populate("customer")

    .populate("loan")

    .populate("emi")

    .populate("assignedAgent");


  }





  /**
   * Close Case
   */
  async closeCase(caseId){


    return RecoveryCase.findByIdAndUpdate(

      caseId,

      {

        status:"CLOSED",

        stage:"CLOSED",

        closedAt:new Date()

      },

      {

        new:true

      }

    );


  }





  /**
   * My Assigned Cases
   */
  async getMyCases(employeeId){


    return RecoveryCase.find({

      assignedAgent:employeeId

    })

    .populate(
      "customer",
      "fullName mobile"
    )

    .populate(
      "loan",
      "loanNumber"
    )

    .populate(
      "emi",
      "emiAmount dueDate"
    )

    .sort({

      priority:-1,

      createdAt:-1

    });


  }





  /**
   * Create Recovery Activity
   */
  async createActivity(
    payload,
    options={}
  ){

    return RecoveryActivity.create(
      [
        payload
      ],
      options
    )
    .then(result=>result[0]);

  }





  /**
   * Get Recovery Timeline
   */
  async getActivities(caseId){


    return RecoveryActivity.find({

      recoveryCase:caseId

    })

    .populate(
      "actor",
      "fullName employeeId name"
    )

    .sort({

      createdAt:-1

    });


  }





  /**
   * Create Recovery Payment
   */
  async createPayment(
    payload,
    options={}
  ){

    return Payment.create(

      [
        payload
      ],

      options

    )
    .then(result=>result[0]);

  }





  /**
   * Update EMI
   */
  async updateEmi(
    emiId,
    payload,
    options={}
  ){

    return EMI.findByIdAndUpdate(

      emiId,

      payload,

      {

        new:true,

        runValidators:true,

        ...options

      }

    );

  }





  /**
   * Find Payment By UTR
   */
  async findPaymentByUTR(
    utrNumber
  ){

    return Payment.findOne({

      utrNumber

    });

  }

  /**
 * Recovery Dashboard
 */
async getDashboard() {

  const [
    totalCases,
    openCases,
    assignedCases,
    inProgress,
    closedCases,
    settledCases,
    totalOutstanding,
  ] = await Promise.all([

    RecoveryCase.countDocuments(),

    RecoveryCase.countDocuments({
      status: "OPEN",
    }),

    RecoveryCase.countDocuments({
      status: "ASSIGNED",
    }),

    RecoveryCase.countDocuments({
      status: "IN_PROGRESS",
    }),

    RecoveryCase.countDocuments({
      status: "CLOSED",
    }),

    RecoveryCase.countDocuments({
      stage: "SETTLED",
    }),

    RecoveryCase.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$outstandingAmount",
          },
        },
      },
    ]),

  ]);

  return {

    totalCases,

    openCases,

    assignedCases,

    inProgress,

    settledCases,

    closedCases,

    totalOutstanding:
      totalOutstanding[0]?.total || 0,

  };

}

/**
 * Agent Performance
 */
async getAgentPerformance() {

  return RecoveryCase.aggregate([

    {
      $match: {
        assignedAgent: {
          $ne: null,
        },
      },
    },

    {
      $group: {

        _id: "$assignedAgent",

        totalCases: {
          $sum: 1,
        },

        totalOutstanding: {
          $sum: "$outstandingAmount",
        },

        closedCases: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$status",
                  "CLOSED",
                ],
              },
              1,
              0,
            ],
          },
        },

      },
    },

    {
      $lookup: {

        from: "employees",

        localField: "_id",

        foreignField: "_id",

        as: "agent",

      },

    },

    {
      $unwind: "$agent",
    },

    {
      $project: {

        _id: 0,

        agentId: "$agent.employeeId",

        fullName: "$agent.fullName",

        totalCases: 1,

        closedCases: 1,

        totalOutstanding: 1,

      },

    },

  ]);

}

/**
 * Employee Recovery Dashboard
 */
async getEmployeeDashboard(employeeId) {

  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);

  const todayEnd = new Date();
  todayEnd.setHours(23,59,59,999);


  const [
    totalCases,
    pendingCases,
    activeCases,
    completedCases,
    todayFollowups,
    totalOutstanding,
    priorityStats,
    todayCases,
    recentActivities,
    totalCollected
  ] = await Promise.all([


    // Total Cases
    RecoveryCase.countDocuments({
      assignedAgent: employeeId
    }),


    // Pending
    RecoveryCase.countDocuments({
      assignedAgent: employeeId,
      status:"OPEN"
    }),


    // Active
    RecoveryCase.countDocuments({
      assignedAgent: employeeId,
      status:"IN_PROGRESS"
    }),


    // Completed
    RecoveryCase.countDocuments({
      assignedAgent: employeeId,
      status:{
        $in:["CLOSED","COMPLETED"]
      }
    }),


    // Today Followups
    RecoveryCase.countDocuments({
      assignedAgent:employeeId,
      nextFollowupDate:{
        $gte:todayStart,
        $lte:todayEnd
      }
    }),


    // Outstanding
    RecoveryCase.aggregate([
      {
        $match:{
          assignedAgent:employeeId
        }
      },
      {
        $group:{
          _id:null,
          total:{
            $sum:"$outstandingAmount"
          }
        }
      }
    ]),


    // Priority Wise
    RecoveryCase.aggregate([

      {
        $match:{
          assignedAgent:employeeId
        }
      },

      {
        $group:{
          _id:"$priority",
          count:{
            $sum:1
          }
        }
      }

    ]),



    // Today's Work
 RecoveryCase.find({

  assignedAgent:employeeId,

  nextFollowupDate:{
    $gte:todayStart,
    $lte:todayEnd
  }

})
.populate(
  "customer",
  "fullName mobile email"
)
.populate(
  "loan",
  "loanNumber"
)
.populate(
  "emi",
  "installmentNumber emiAmount dueDate"
)
    .populate(
      "customer",
      "fullName mobile"
    )
    .sort({
      priority:-1
    })
    .limit(10),




    // Recent Activities
    RecoveryActivity.find({

      actor:employeeId

    })
    .sort({
      createdAt:-1
    })
    .limit(10),




    // Collection Amount
    RecoveryCase.aggregate([

      {
        $match:{
          assignedAgent:employeeId
        }
      },

      {
        $group:{
          _id:null,

          total:{
            $sum:"$totalCollectedAmount"
          }

        }
      }

    ])

  ]);



  return {


    summary:{
      totalCases,
      pendingCases,
      activeCases,
      completedCases,
      todayFollowups,
      totalOutstanding:
        totalOutstanding[0]?.total || 0
    },


    priority:{
      data:priorityStats
    },


    todayCases,


    recentActivities,


    performance:{
      totalCollected:
        totalCollected[0]?.total || 0
    }


  };

}

/**
 * Pending Followups
 */
async getPendingFollowups() {

  return RecoveryCase.find({

    nextFollowupDate: {

      $lte: new Date(),

    },

    status: {

      $nin: [

        "CLOSED",

        "COMPLETED",

      ],

    },

  })

    .populate(
      "customer",
      "fullName mobile"
    )

    .populate(
      "assignedAgent",
      "fullName employeeId"
    )

    .sort({

      nextFollowupDate: 1,

    });

}

/**
 * Promise To Pay Cases
 */
async getPromiseCases() {

  return RecoveryCase.find({

    stage: "PROMISE_TO_PAY",

    "promiseDetails.status": "ACTIVE",

  })

    .populate(
      "customer",
      "fullName mobile"
    )

    .populate(
      "assignedAgent",
      "fullName employeeId"
    )

    .sort({

      "promiseDetails.promisedDate": 1,

    });

}

/**
 * Send To Legal
 */
async sendLegal(
  caseId,
  payload
) {

  return RecoveryCase.findByIdAndUpdate(

    caseId,

    {

      stage: "LEGAL",

      legalDetails: payload,

      legalInitiatedAt: new Date(),

    },

    {

      new: true,

    }

  );

}

/**
 * Add Activity
 */
async addActivity(payload) {

  return RecoveryActivity.create(payload);

}



}


export default new RecoveryRepository();