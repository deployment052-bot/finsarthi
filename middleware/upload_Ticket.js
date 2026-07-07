import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudanryConnection.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tickets",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

export const upload = multer({ storage });