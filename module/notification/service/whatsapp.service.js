import axios from "axios";
import "dotenv/config";

class WhatsAppService {
  constructor() {
    console.log("========= WASENDER DEBUG =========");
    console.log("BASE URL:", process.env.WASENDER_BASE_URL);
    console.log(
      "API KEY:",
      process.env.WASENDER_API_KEY ? "FOUND" : "MISSING"
    );
    console.log("=================================");

    this.client = axios.create({
      baseURL: process.env.WASENDER_BASE_URL,
      headers: {
        Authorization: `Bearer ${process.env.WASENDER_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
  }

  async send(payload) {
    try {
      console.log(
        "Final Request URL:",
        this.client.defaults.baseURL + "/send-message"
      );

      console.log("Payload:", payload);

      const { data } = await this.client.post(
        "/send-message",
        payload
      );

      console.log("✅ WhatsApp Response:", data);

      return data;
    } catch (error) {
      console.error(
        "❌ WhatsApp Error:",
        error.response?.status,
        error.response?.data || error.message
      );

      throw error;
    }
  }

  // =========================
  // TEXT
  // =========================
  async sendText(phone, text) {
    return this.send({
      to: phone,
      text,
    });
  }

  // =========================
  // IMAGE
  // =========================
  async sendImage(phone, imageUrl, caption = "") {
    return this.send({
      to: phone,
      text: caption,
      imageUrl,
    });
  }

  // =========================
  // DOCUMENT
  // =========================
  async sendDocument(phone, documentUrl, fileName, caption = "") {
    return this.send({
      to: phone,
      text: caption,
      documentUrl,
      fileName,
    });
  }

  // =========================
  // VIDEO
  // =========================
  async sendVideo(phone, videoUrl, caption = "") {
    return this.send({
      to: phone,
      text: caption,
      videoUrl,
    });
  }

  // =========================
  // AUDIO
  // =========================
  async sendAudio(phone, audioUrl) {
    return this.send({
      to: phone,
      audioUrl,
    });
  }
}

export default new WhatsAppService();