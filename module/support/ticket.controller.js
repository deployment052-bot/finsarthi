import { Ticket } from "../support/ticket.model.js";
import { getNextTicketNumber } from "../../comman/utils/autoincrement.js";
import chatService from "./chatbot/chat.service.js";
import { sendNotification } from "../notification/serrvice.js";
export const createTicket = async (req, res) => {
  try {

    const {
      category,
      subject,
      description,
      mobile,
      issueDate
    } = req.body;



    if (!category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }



    const attachments = Array.isArray(req.files)
      ? req.files.map((file) =>
          file.path.replace(/\\/g, "/")
        )
      : [];



    // Generate Ticket Number
    const ticketNumber =
      await getNextTicketNumber();




    const ticket = await Ticket.create({

      user: req.user._id,

      ticketNumber,


      category,

      subject,

      description,


      mobile,

      issueDate,


      attachments,


      // Ticket Source
      source:"APP",


      // Manual ticket creation
      createdByBot:false

    });



// In-App Notification
await notificationService.send({
  user: req.user._id,
  phone: mobile,
  title: "Complaint Registered",
  message: `Your complaint has been registered successfully.

Ticket Number: ${ticket.ticketNumber}

Our support team will review your complaint shortly.`,
  type: "GENERAL",

  // In-App only
  sendWhatsapp: false,
});
    return res.status(201).json({

      success:true,

      message:
      "Ticket raised successfully",

      data:ticket

    });



  } catch(error){


    return res.status(500).json({

      success:false,

      message:error.message

    });


  }
};
export const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email mobile")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const startChat = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await chatService.startChat(userId);

    return res.status(200).json({
      success: true,

      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// Reply Chat
export const replyChat = async (req, res) => {
  try {
    const {
      sessionId,
      answer,
      payload = {},
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required",
      });
    }

    const result = await chatService.reply(
      sessionId,
      answer,
      payload
    );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel Chat
export const cancelChat = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const result = await chatService.cancelChat(sessionId);

    return res.status(200).json({
      success: true,

      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
 

export const resolveTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { resolution } = req.body;

    if (!resolution?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resolution is required.",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (ticket.status === "RESOLVED") {
      return res.status(400).json({
        success: false,
        message: "Ticket is already resolved.",
      });
    }

    ticket.status = "RESOLVED";
    ticket.resolution = resolution;
    ticket.resolvedBy = req.user._id;
    ticket.resolvedAt = new Date();

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Ticket resolved successfully.",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
