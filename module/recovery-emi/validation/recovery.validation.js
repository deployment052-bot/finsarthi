import Joi from "joi";

/**
 * Queue Filters
 */
export const getQueueValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),

  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL"),

  status: Joi.string().valid(
    "OPEN",
    "IN_PROGRESS",
    "ON_HOLD",
    "COMPLETED",
    "CLOSED",
  ),

  stage: Joi.string().valid(
    "QUEUE",
    "ASSIGNED",
    "CALLING",
    "VISIT",
    "PROMISE_TO_PAY",
    "PARTIAL_PAYMENT",
    "FAILED",
    "ESCALATED",
    "LEGAL",
    "SETTLED",
    "CLOSED",
  ),

  search: Joi.string().trim().allow(""),
});

/**
 * Assign Agent
 */
export const assignAgentValidation = Joi.object({
  agentId: Joi.string().required(),
});

/**
 * Call Activity
 */
/**
 * Call Activity
 */
export const callValidation = Joi.object({
  remark: Joi.string().trim().required(),

  outcome: Joi.string()
    .valid(
      "SUCCESS",
      "FAILED",
      "NO_RESPONSE",
      "NOT_AVAILABLE",
      "CUSTOMER_REFUSED",
      "PARTIAL_PAYMENT",
      "FULL_PAYMENT",
      "PROMISE",
    )
    .required(),

  nextFollowupDate: Joi.date().greater("now").optional(),

  /**
   * Promise To Pay Details
   * Only required when outcome = PROMISE
   */

  promisedAmount: Joi.number().min(1).when("outcome", {
    is: "PROMISE",

    then: Joi.required(),

    otherwise: Joi.optional(),
  }),

  promisedDate: Joi.date().greater("now").when("outcome", {
    is: "PROMISE",

    then: Joi.required(),

    otherwise: Joi.optional(),
  }),
});

/**
 * Visit Activity
 */
export const visitValidation = Joi.object({
  remark: Joi.string().trim().required(),

  latitude: Joi.number().min(-90).max(90).required(),

  longitude: Joi.number().min(-180).max(180).required(),

  image: Joi.string().uri().allow("", null),

  audio: Joi.string().uri().allow("", null),

  outcome: Joi.string()
    .valid(
      "SUCCESS",
      "FAILED",
      "NO_RESPONSE",
      "NOT_AVAILABLE",
      "CUSTOMER_REFUSED",
    )
    .required(),

  nextFollowupDate: Joi.date().greater("now").optional(),
});

/**
 * Recovery Payment
 *
 * NOTE:
 * Existing EMI Payment flow ko change nahi kar rahe.
 * Ye validation sirf Recovery API ke liye hai.
 */
export const paymentValidation = Joi.object({
  amount: Joi.number().min(1).required(),

  paymentSource: Joi.string()
    .valid("UPI", "BANK_TRANSFER", "CASH", "CHEQUE")
    .required(),

  utrNumber: Joi.string().trim().allow("", null),

  customerRemark: Joi.string().trim().allow("", null),

  paymentProof: Joi.object({
    url: Joi.string().uri().required(),

    publicId: Joi.string().required(),
  }).optional(),
});

/**
 * Remark
 */
export const remarkValidation = Joi.object({
  remark: Joi.string().trim().required(),
});

/**
 * Escalation
 */
export const escalationValidation = Joi.object({
  reason: Joi.string().trim().required(),
});

/**
 * Close Case
 */
export const closeCaseValidation = Joi.object({
  remark: Joi.string().trim().required(),

  closedReason: Joi.string()
    .valid("FULL_PAYMENT", "SETTLEMENT", "LEGAL", "WRITE_OFF", "OTHER")
    .required(),
});
