import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  pdfUrl: { type: String },
  goalADA: { type: Number, required: true },
  raisedADA: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rejectionMessage: { type: String }, // facultatif
  status: { type: String, enum: ["draft","pending","published","rejected","funded"], default: "draft" },
  smartContractAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Project", projectSchema);
