import { SupportChatSession } from "./supportChatSession.model.js";
import { Ticket } from "../ticket.model.js";
import { QUESTIONS } from "./questions.js";
import { getNextTicketNumber } from "../../../comman/utils/autoincrement.js";
import { INQUIRY_OPTIONS } from "./inquiryFlow.js";
class ChatService {
  // Start Chat
  async startChat(userId) {
    const session = await SupportChatSession.create({
      user: userId,
      mode: null,
      status: "ACTIVE",
      currentStep: 0,
      answers: {},
    });

    return {
      sessionId: session._id,

      message: "Welcome to FinSarthi Support 👋 How can we help you?",

      options: [
        {
          label: "Raise Complaint",
          value: "COMPLAINT",
        },
        {
          label: "Inquiry",
          value: "INQUIRY",
        },
      ],
    };
  }

  // Reply Chat
  async reply(sessionId, answer) {
    const session = await SupportChatSession.findById(sessionId);

    if (!session) {
      throw new Error("Chat session not found");
    }

    if (session.status !== "ACTIVE") {
      throw new Error("Chat session closed");
    }

    // First Selection
    // Complaint / Inquiry

    if (!session.mode) {
      if (answer === "COMPLAINT") {
        session.mode = "COMPLAINT";

        await session.save();

        const question = QUESTIONS[0];

        return this.getQuestionResponse(session, question);
      }

 if (answer === "INQUIRY") {
  session.mode = "INQUIRY";

  await session.save();

  return {
    completed: false,

    question: "Please select inquiry type.",

    type: "OPTIONS",

    options: INQUIRY_OPTIONS,
  };
}

      throw new Error("Invalid option");
    }

    // Inquiry flow
   // ===============================
// Inquiry Flow
// ===============================
if (session.mode === "INQUIRY") {

  // Complaint Status
 if (answer === "COMPLAINT_STATUS") {

  session.inquiryType = "COMPLAINT_STATUS";
  await session.save();

  const tickets = await Ticket.find({
    user: session.user,
    status: {
      $nin: ["RESOLVED", "CLOSED"],
    },
  }).select("ticketNumber status");

    if (!tickets.length) {
      return {
        completed: true,
        message: "You don't have any active complaints.",
      };
    }

    return {
      completed: false,

      question: "Please select your complaint.",

      type: "OPTIONS",

      options: tickets.map(ticket => ({
        label: `${ticket.ticketNumber} (${ticket.status})`,
        value: ticket._id,
      })),
    };
  }

  // Ticket Selected
if (session.inquiryType === "COMPLAINT_STATUS") {

  const ticket = await Ticket.findOne({
    _id: answer,
    user: session.user,
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  session.status = "COMPLETED";
  await session.save();

  return {
    completed: true,

    ticketNumber: ticket.ticketNumber,

    status: ticket.status,

    message: `Your complaint is currently ${ticket.status}.`,
  };
}

  // Future Inquiry
  return {
    completed: true,
    message: "This inquiry feature will be available soon.",
  };
}

    // Complaint flow

    const currentQuestion = QUESTIONS[session.currentStep];

    if (!currentQuestion) {
      return await this.createTicketFromChat(session);
    }

    // Save Answer (Map)

    session.answers.set(currentQuestion.field, answer);

    // Next step

    session.currentStep += 1;

    const nextQuestion = QUESTIONS[session.currentStep];

    // Last Question Completed

    if (!nextQuestion) {
      await session.save();

      return await this.createTicketFromChat(session);
    }

    session.currentField = nextQuestion.field;

    await session.save();

    return this.getQuestionResponse(session, nextQuestion);
  }

  // Question Response Helper

  getQuestionResponse(session, question) {
    return {
      completed: false,

      sessionId: session._id,

      step: question.step,

      field: question.field,

      question: question.question,

      type: question.type,

      options: question.options || [],

      required: question.required,
    };
  }

  // Create Ticket
  async createTicketFromChat(session) {
    const ticketNumber = await getNextTicketNumber();

    const ticket = await Ticket.create({
      user: session.user,

      ticketNumber,

      category: session.answers.get("category"),

      mobile: session.answers.get("mobile"),

      issueDate: session.answers.get("issueDate"),

      subject: session.answers.get("subject"),

      description: session.answers.get("description"),

      attachments: session.answers.get("attachments") || [],

      source: "CHATBOT",

      createdByBot: true,
    });

    session.ticket = ticket._id;

    session.status = "COMPLETED";

    await session.save();

    return {
      completed: true,

      message: "Complaint raised successfully",

      ticketNumber: ticket.ticketNumber,

      ticketId: ticket._id,
    };
  }

  // Cancel Chat

  async cancelChat(sessionId) {
    const session = await SupportChatSession.findById(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    session.status = "CANCELLED";

    await session.save();

    return {
      success: true,

      message: "Chat cancelled successfully",
    };
  }
}

export default new ChatService();
