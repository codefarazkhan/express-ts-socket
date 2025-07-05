import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
