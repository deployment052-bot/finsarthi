import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    // Customer
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Auto Generated Ticket Number
    ticketNumber: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },

    // Issue Category
    category: {
      type: String,
      enum: [
        "LOAN",
        "EMI",
        "PAYMENT",
        "TRANSACTION",
        "ACCOUNT",
        "KYC",
        "CARD",
        "APP",
        "OTHER",
      ],
      required: true,
    },
status: {
    type: String,
    enum: ["OPEN", "RESOLVED"],
    default: "OPEN"
},

resolution: {
    type: String,
    default: ""
},

resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null
},

resolvedAt: {
    type: Date,
    default: null
},
    // Subject
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    // Issue Description
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Registered Mobile Number
    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    // When issue happened
    issueDate: {
      type: Date,
    },

    // Screenshot / Documents
    attachments: {
      type: [String],
      default: [],
    },

    // Ticket Source
    source: {
      type: String,
      enum: ["CHATBOT", "APP", "WEB", "ADMIN"],
      default: "CHATBOT",
    },

    // Ticket Priority
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    // Assigned Support Agent
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    mobile: {
  type: String,
  required: true,
},

issueDate: {
  type: Date,
},

    // Current Status
    status: {
      type: String,
      enum: [
        "OPEN",
        "IN_PROGRESS",
        "WAITING_FOR_CUSTOMER",
        "RESOLVED",
        "CLOSED",
        "REJECTED",
      ],
      default: "OPEN",
    },

    // Admin Resolution
    resolution: {
      type: String,
      default: "",
      trim: true,
    },

    // Closed At
    closedAt: {
      type: Date,
      default: null,
    },

    // Created By Chatbot
    createdByBot: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Ticket = mongoose.model("Ticket", ticketSchema);