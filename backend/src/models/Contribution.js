import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  amountADA: { type: Number, required: true },
  txHash: { type: String, default: "" }, // txHash fake pour dev/mock
  status: { type: String, enum: ["pending", "confirmed", "failed"], default: "pending" },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Contribution", contributionSchema);
