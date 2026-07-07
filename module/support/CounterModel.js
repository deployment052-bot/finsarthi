import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: String, // "ticket"
  seq: Number,
});

export const Counter = mongoose.model("Counter", counterSchema);