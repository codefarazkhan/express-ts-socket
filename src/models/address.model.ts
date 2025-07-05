import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, {
  timestamps: true
});

export const Address = mongoose.model("Address", addressSchema); 