import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      immutable: true,
    },

    name: {
      type: String,
    //   required: true,
    //   trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      default: "ADMIN",
    },

    permissions: {
      type: [String],
      default: [
        "APPROVE_LOAN",
        "REJECT_LOAN",
        "VIEW_USERS",
        "MANAGE_EMPLOYEES",
      ],
    },

    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },

    lastLoginAt: Date,
  },
  { timestamps: true }
);

// 🔐 hash password
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

const Admin =
  mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;