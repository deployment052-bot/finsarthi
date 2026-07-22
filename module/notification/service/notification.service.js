import Notification from "../notification.model.js";
import whatsappService from "./whatsapp.service.js";

class NotificationService {
  async send({
    user,
    phone,
    title,
    message,
    type,
    image = null,
    document = null,
    fileName = null,
    sendWhatsapp = false,
  }) {
    console.log("🔥 Notification Service Triggered");

    console.log({
      user,
      phone,
      title,
      type,
      image,
      document,
      fileName,
      sendWhatsapp,
    });

    // Save notification
    const notification = await Notification.create({
      user,
      title,
      message,
      type,
    });

    console.log("✅ Notification Saved:", notification._id);

    // Skip WhatsApp
    if (!sendWhatsapp) {
      console.log("⚠️ WhatsApp sending disabled.");
      return notification;
    }

    // Phone missing
    if (!phone) {
      console.error("❌ WhatsApp skipped: Phone number missing");
      return notification;
    }

    console.log("📲 Sending WhatsApp to:", phone);

    try {
      let response;

      // =========================
      // IMAGE
      // =========================
      if (image) {
        console.log("🖼 Sending Image");

        response = await whatsappService.sendImage(
          phone,
          image,
          message
        );
      }

      // =========================
      // DOCUMENT
      // =========================
      else if (document) {
        console.log("📄 Sending Document");

        response = await whatsappService.sendDocument(
          phone,
          document,
          fileName,
          message
        );
      }

      // =========================
      // TEXT
      // =========================
      else {
        console.log("💬 Sending Text");

        response = await whatsappService.sendText(
          phone,
          message
        );
      }

      console.log("✅ WhatsApp Sent Successfully");
      console.log(response);

    } catch (error) {

      console.error("❌ WhatsApp Error");

      if (error.response) {
        console.error("Status :", error.response.status);
        console.error("Data   :", error.response.data);
      } else {
        console.error(error.message);
      }

    }

    return notification;
  }
}

export default new NotificationService();