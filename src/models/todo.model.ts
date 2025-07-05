import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export const Todo = mongoose.model("Todo", todoSchema); 