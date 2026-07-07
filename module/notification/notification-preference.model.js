// notification-preference.model.js

import mongoose from "mongoose";

const notificationPreferenceSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true,
      },

      emiReminders: {
        type: Boolean,
        default: true,
      },

      paymentAlerts: {
        type: Boolean,
        default: true,
      },
      accountUpdates: {
  type: Boolean,
  default: true,
},

      savingGoalUpdates: {
        type: Boolean,
        default: true,
      },

      loanUpdates: {
        type: Boolean,
        default: true,
      },

      creditScoreUpdates: {
        type: Boolean,
        default: true,
      },

      transactionAlerts: {
        type: Boolean,
        default: true,
      },

      promotionalOffers: {
        type: Boolean,
        default: false,
      },

      dailySummary: {
        type: Boolean,
        default: false,
      },

      weeklySummary: {
        type: Boolean,
        default: false,
      },

      monthlySummary: {
        type: Boolean,
        default: false,
      },

      pushEnabled: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "NotificationPreference",
  notificationPreferenceSchema
);