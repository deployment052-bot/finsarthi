import { Ticket } from "../support/ticket.model.js";
import { getNextTicketNumber  } from "../../comman/utils/autoincrement.js";

export const createTicket = async (req, res) => {
  try {
    const { category, subject, description } = req.body;

   
    if (!category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    
    const attachments = Array.isArray(req.files)
      ? req.files.map((file) => file.path.replace(/\\/g, "/"))
      : [];

    // 🔥 generate ticket number
    const ticketNumber = await getNextTicketNumbe              ();

    
    const ticket = await Ticket.create({
      user: req.user._id,
      ticketNumber, 
      category,
      subject,
      description,
      attachments,
    });

    return res.status(201).json({
      success: true,
      message: "Ticket raised successfully",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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

