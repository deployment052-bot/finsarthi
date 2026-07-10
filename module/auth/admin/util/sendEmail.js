import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}) => {
  try {
    await sgMail.send({
      to,
      from: {
        email: process.env.MAIL_FROM,
        name: process.env.MAIL_NAME,
      },
      subject,
      text,
      html,
    });

    return true;
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error.message);
    throw new Error("Unable to send email.");
  }
};