import sgMail from "@sendgrid/mail";
import "dotenv/config";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  async sendEmail({ to, subject, text, html }) {
    try {
      const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        text,
        html,
      };

      const response = await sgMail.send(msg);

      console.log("✅ Email Sent:", to);

      return response;
    } catch (error) {
      console.error(
        "❌ Email Error:",
        error.response?.body || error.message
      );

      throw error;
    }
  }
}

export default new EmailService();