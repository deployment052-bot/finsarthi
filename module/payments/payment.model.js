import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMode: {
      type: String,
      enum: ["UPI", "CARD", "NETBANKING", "CASH"],
    },

    transactionId: String,

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    paidAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema);