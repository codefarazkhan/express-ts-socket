import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
  password: { type: String, required: true },
});

export const User = mongoose.model("User", userSchema);
