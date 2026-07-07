import { Counter } from "../../module/support/CounterModel.js";

export const getNextTicketNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "ticket" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const number = counter.seq.toString().padStart(6, "0");

  return `TKT-${number}`;
};