import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./module/auth/admin/admin.model.js"; // apne path ke hisaab se change karo

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const exists = await Admin.findOne({
      email: "admin@finsarthi.com",
    });

    if (exists) {
      console.log("Admin already exists.");
      process.exit();
    }

    const admin = new Admin({
      adminId: "ADM001",
      name: "Super Admin",
      email: "admin@finsarthi.com",
      password: "Admin@123", // pre-save hook automatically hash karega
      role: "ADMIN",
      status: "ACTIVE",
    });

    await admin.save();

    console.log("✅ Admin created successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();